import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authLogin, getPopularMovies } from '../../api';
import { OkoLogo } from '../../components/Logo';
import MovieCard from '../../components/MovieCard';

// Normalize TMDB popular shape → what MovieCard expects
const normalizeTmdb = (m) => ({
    id:           m.id,
    title:        m.title,
    releaseYear:  (m.releaseDate ?? m.release_date ?? '').slice(0, 4),
    posterUrl:    (m.posterPath ?? m.poster_path)
        ? `https://image.tmdb.org/t/p/w500${m.posterPath ?? m.poster_path}`
        : null,
    averageRating: m.averageRating ?? 0,
});

// Build full TMDB image URL from a raw path value
const tmdbImg = (path, size = 'original') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function Landing() {
    const { login } = useAuth();
    const navigate  = useNavigate();

    const [form,      setForm]     = useState({ usernameOrEmail: '', password: '' });
    const [error,     setError]    = useState('');
    const [loading,   setLoading]  = useState(false);
    const [newMovies, setNewMovies] = useState([]);
    const [rawMovies, setRawMovies] = useState([]); // keep raw for hero backdrop/title

    // Load popular movies from TMDB for the bottom strip
    useEffect(() => {
        getPopularMovies()
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data.content ?? [];
                setRawMovies(list);
                setNewMovies(list.map(normalizeTmdb));
            })
            .catch(() => {});
    }, []);

    // Pick first movie as the hero feature
    const featured     = rawMovies[0] ?? null;
    const featuredUrl  = featured
        ? tmdbImg(featured.backdropPath ?? featured.backdrop_path ?? featured.posterPath ?? featured.poster_path)
        : null;
    const featuredTitle = featured?.title ?? '';
    const featuredYear  = (featured?.releaseDate ?? featured?.release_date ?? '').slice(0, 4);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authLogin(form);
            login(data);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-oko-bg">

            {/* ── Nav ──────────────────────────────────────────────────────────── */}
            <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <OkoLogo size="md" />
                    <div className="hidden md:flex gap-6">
                        {['Films', 'Lists', 'Members', 'Journal'].map((l) => (
                            <span key={l} className="text-sm text-oko-muted hover:text-oko-text cursor-pointer transition-colors">{l}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-oko-muted">Sign in ↓</span>
                    <Link to="/register" className="text-sm font-semibold bg-oko-red hover:bg-oko-red-dark text-white px-4 py-2 rounded-md transition-colors">
                        Create account
                    </Link>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <div className="relative h-[520px] overflow-hidden">

                {/* Full-width backdrop — image fills the entire hero */}
                {featuredUrl && (
                    <img
                        src={featuredUrl}
                        alt={featuredTitle}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                {/* Left fade — dark bleeds in from the left edge */}
                <div className="absolute inset-y-0 left-0 w-[35%] z-[2]"
                     style={{ background: 'linear-gradient(to right, #14181c 0%, #14181c 5%, rgba(20,24,28,0.7) 50%, transparent 100%)' }}
                />
                {/* Right fade */}
                <div className="absolute inset-y-0 right-0 w-[35%] z-[2]"
                     style={{ background: 'linear-gradient(to left, #14181c 0%, #14181c 5%, rgba(20,24,28,0.7) 50%, transparent 100%)' }}
                />
                {/* Bottom fade — smoothly dissolves into page bg, no hard line */}
                <div className="absolute bottom-0 left-0 right-0 z-[2]"
                     style={{ height: '55%', background: 'linear-gradient(to top, #14181c 0%, rgba(20,24,28,0.9) 30%, rgba(20,24,28,0.5) 65%, transparent 100%)' }}
                />
                {/* Top fade — softens the very top edge */}
                <div className="absolute top-0 left-0 right-0 h-24 z-[2]"
                     style={{ background: 'linear-gradient(to bottom, #14181c 0%, rgba(20,24,28,0.6) 50%, transparent 100%)' }}
                />

                {featuredTitle && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                         style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>
            <span className="text-[10px] text-white/20 tracking-widest uppercase">
              {featuredTitle}{featuredYear ? ` (${featuredYear})` : ''}
            </span>
                    </div>
                )}

                {/* Hero text + login form */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-14 px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center leading-snug mb-8 drop-shadow-xl">
                        Track films you've watched.<br />
                        Save those you want to see.<br />
                        <span className="text-oko-red">Tell your friends what's good.</span>
                    </h1>

                    {/* Inline login form */}
                    <form onSubmit={handleLogin} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-lg">
                        <input
                            type="text"
                            placeholder="Username or email"
                            value={form.usernameOrEmail}
                            onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                            className="flex-1 w-full bg-black/50 backdrop-blur border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-oko-red"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="flex-1 w-full bg-black/50 backdrop-blur border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-oko-red"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-oko-red hover:bg-oko-red-dark text-white font-semibold px-6 py-2.5 rounded-md text-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    {error && <p className="text-oko-red text-xs mt-2">{error}</p>}

                    <p className="text-white/40 text-xs mt-3">
                        New here?{' '}
                        <Link to="/register" className="text-oko-red hover:underline">Create a free account</Link>
                    </p>
                </div>
            </div>

            {/* ── New & Notable ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-baseline gap-3 mb-5">
                    <h2 className="text-xs font-semibold text-oko-text tracking-widest uppercase">New &amp; notable</h2>
                    <span className="text-xs text-oko-subtle">Films people are watching right now</span>
                </div>

                {newMovies.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {newMovies.map((m) => (
                            <MovieCard key={m.id} movie={m} />
                        ))}
                    </div>
                ) : (
                    /* Placeholder skeleton while backend loads */
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-oko-surface rounded-md animate-pulse border border-oko-border" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}