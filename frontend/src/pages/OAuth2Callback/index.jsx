import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { OkoSpinner, OkoLogo } from '../../components/Logo';

const ERROR_MESSAGES = {
    'access_denied':       'You cancelled the Google sign-in.',
    'account_exists':      'An account with this email already exists. Please log in with your password.',
    'oauth2_error':        'Google sign-in failed. Please try again.',
    'server_error':        'Something went wrong on our end. Please try again.',
    'email_not_verified':  'Your Google account email is not verified.',
};

export default function OAuth2Callback() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token      = params.get('token');
        const errorParam = params.get('error') ?? params.get('error_description');

        // Error from backend — show message, don't redirect automatically
        if (errorParam) {
            const msg = ERROR_MESSAGES[errorParam]
                ?? (errorParam.length < 80 ? errorParam : 'Sign in failed. Please try again.');
            setError(msg);
            return;
        }

        if (token) {
            try {
                const decoded  = jwtDecode(token);
                const username = decoded.sub ?? decoded.username ?? decoded.name ?? '';
                const role     = decoded.role ?? decoded.roles?.[0] ?? 'USER';
                login({ token, username, role });
                navigate('/home', { replace: true });
            } catch {
                setError('Sign in failed — invalid token. Please try again.');
            }
        } else {
            // No token and no error — probably a cancelled flow, go home silently
            navigate('/', { replace: true });
        }
    }, []); // eslint-disable-line

    // Error state — show message with option to go back
    if (error) {
        return (
            <div className="min-h-screen bg-oko-bg flex flex-col items-center justify-center gap-6 px-4">
                <OkoLogo size="md" />
                <div className="w-full max-w-sm bg-oko-surface border border-oko-border rounded-xl p-6 text-center">
                    <div className="text-3xl mb-3">⚠</div>
                    <h2 className="text-oko-text font-semibold text-base mb-2">Sign in failed</h2>
                    <p className="text-oko-muted text-sm mb-5">{error}</p>
                    <div className="flex flex-col gap-2">
                        <a
                            href="http://localhost:8080/oauth2/authorization/google"
                            className="w-full flex items-center justify-center gap-2 bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors"
                        >
                            Try again with Google
                        </a>
                        <Link
                            to="/"
                            replace
                            className="w-full text-center text-sm text-oko-muted hover:text-oko-text transition-colors py-2"
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state while processing token
    return (
        <div className="min-h-screen bg-oko-bg flex flex-col items-center justify-center gap-4">
            <OkoSpinner size={56} />
            <p className="text-sm text-oko-muted">Signing you in…</p>
        </div>
    );
}