import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularMovies } from '../../api';
import MovieCard from '../../components/MovieCard';

// FIX: explicitly set tmdbId so MovieCard knows this is a TMDB-sourced record
// and must sync — never set localId here since we don't have it yet.
const normalizeTmdb = (m) => ({
    id:            m.id,
    tmdbId:        m.id,   // explicit — tells MovieCard to sync via this id
    title:         m.title,
    releaseYear:   m.release_date ? m.release_date.slice(0, 4) : '',
    posterUrl:     m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
    averageRating: m.averageRating ?? 0,
    // localId intentionally omitted — will be resolved on first click
});

const tmdbImg = (path, size = 'original') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function Landing() {
    const [newMovies, setNewMovies] = useState([]);
    const [rawMovies, setRawMovies] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getPopularMovies()
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : data.content ?? [];
                setRawMovies(list);
                setNewMovies(list.map(normalizeTmdb));
            })
            .catch(() => {});
    }, []);

    const featured      = rawMovies[0] ?? null;
    const featuredUrl   = featured
        ? tmdbImg(featured.backdropPath ?? featured.backdrop_path ?? featured.posterPath ?? featured.poster_path)
        : null;
    const featuredTitle = featured?.title ?? '';
    const featuredYear  = (featured?.releaseDate ?? featured?.release_date ?? '').slice(0, 4);

    return (
        <div className="min-h-screen bg-oko-bg">

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <div className="relative h-[520px] overflow-hidden">

                {featuredUrl && (
                    <img
                        src={featuredUrl}
                        alt={featuredTitle}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                <div className="absolute inset-y-0 left-0 w-[35%] z-[2]"
                     style={{ background: 'linear-gradient(to right, #14181c 0%, #14181c 5%, rgba(20,24,28,0.7) 50%, transparent 100%)' }}
                />
                <div className="absolute inset-y-0 right-0 w-[35%] z-[2]"
                     style={{ background: 'linear-gradient(to left, #14181c 0%, #14181c 5%, rgba(20,24,28,0.7) 50%, transparent 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-[2]"
                     style={{ height: '55%', background: 'linear-gradient(to top, #14181c 0%, rgba(20,24,28,0.9) 30%, rgba(20,24,28,0.5) 65%, transparent 100%)' }}
                />
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

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center leading-snug mb-8 drop-shadow-xl">
                        Track films you've watched.<br />
                        Save those you want to see.<br />
                        <span className="text-oko-red">Tell your friends what's good.</span>
                    </h1>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-oko-red hover:bg-oko-red-dark text-white font-semibold px-8 py-3 rounded-md text-base transition-colors shadow-lg"
                    >
                        Get started — it's free
                    </button>
                </div>
            </div>

            {/* ── Register modal ────────────────────────────────────────────────── */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="w-full max-w-sm bg-oko-surface border border-oko-border rounded-xl shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between px-6 pt-6 pb-0">
                            <h2 className="text-base font-bold text-oko-text">Create your account</h2>
                            <button onClick={() => setShowModal(false)} className="text-oko-subtle hover:text-oko-text text-2xl leading-none">×</button>
                        </div>

                        <div className="px-6 py-5 space-y-3">
                            <a
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
                                className="flex items-center justify-center gap-2.5 w-full bg-oko-bg hover:bg-white/5 text-oko-text border border-oko-border hover:border-oko-muted px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                                </svg>
                                Continue with Google
                            </a>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-oko-border" />
                                <span className="text-oko-faint text-xs">or</span>
                                <div className="flex-1 h-px bg-oko-border" />
                            </div>

                            <Link
                                to="/register"
                                onClick={() => setShowModal(false)}
                                className="flex items-center justify-center w-full border border-oko-border hover:border-oko-muted text-oko-muted hover:text-oko-text px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
                            >
                                Create account with email
                            </Link>

                            <p className="text-center text-xs text-oko-faint pt-1">
                                Already a member?{' '}
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-oko-red hover:underline"
                                >
                                    Sign in from the top right
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

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