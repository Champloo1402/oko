import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { OkoSpinner } from '../../components/Logo';

export default function OAuth2Callback() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token  = params.get('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                // decoded.sub is the username in a standard Spring Security JWT
                const username = decoded.sub ?? decoded.username ?? decoded.name ?? '';
                const role     = decoded.role ?? decoded.roles?.[0] ?? 'USER';
                login({ token, username, role });
                navigate('/home', { replace: true });
            } catch {
                // Malformed token — go back to landing
                navigate('/', { replace: true });
            }
        } else {
            navigate('/', { replace: true });
        }
    }, []); // eslint-disable-line

    return (
        <div className="min-h-screen bg-oko-bg flex flex-col items-center justify-center gap-4">
            <OkoSpinner size={56} />
            <p className="text-sm text-oko-muted">Signing you in…</p>
        </div>
    );
}