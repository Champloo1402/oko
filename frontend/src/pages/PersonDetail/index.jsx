import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPerson, getFilmography, syncMovie } from '../../api';
import { OkoSpinner } from '../../components/Logo';
import { StarDisplay } from '../../components/StarRating';

export default function PersonDetail() {
    const { id } = useParams();
    const [person,      setPerson]      = useState(null);
    const [filmography, setFilmography] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [pRes, fRes] = await Promise.all([getPerson(id), getFilmography(id)]);
                setPerson(pRes.data);
                setFilmography(fRes.data ?? []);
            } catch {
                setError('Could not load this person.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={56} /></div>;
    if (error)   return <div className="text-center py-24 text-oko-red text-sm">{error}</div>;
    if (!person) return null;

    const acted    = filmography.filter((f) => f.roleType === 'ACTOR');
    const directed = filmography.filter((f) => f.roleType === 'DIRECTOR');
    const written  = filmography.filter((f) => f.roleType === 'WRITER');

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex gap-8 mb-12">
                {/* Photo */}
                <div className="flex-shrink-0 w-36 md:w-48">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-oko-border bg-oko-surface">
                        {person.photoUrl ? (
                            <img
                                src={person.photoUrl}
                                alt={person.name}
                                className="w-full h-full object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-oko-faint text-4xl">◉</div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-oko-text mb-4">{person.name}</h1>
                    {person.biography ? (
                        <p className="text-sm text-oko-muted leading-relaxed line-clamp-[10]">
                            {person.biography}
                        </p>
                    ) : (
                        <p className="text-sm text-oko-subtle italic">No biography available.</p>
                    )}
                </div>
            </div>

            {/* ── Filmography sections ───────────────────────────────────────── */}
            {acted.length > 0 && (
                <FilmSection title="Actor in" items={acted} showCharacter />
            )}
            {directed.length > 0 && (
                <FilmSection title="Directed" items={directed} />
            )}
            {written.length > 0 && (
                <FilmSection title="Written by" items={written} />
            )}
        </div>
    );
}

// ─── Film section with poster grid ───────────────────────────────────────────
function FilmSection({ title, items, showCharacter = false }) {
    return (
        <section className="mb-10">
            <h2 className="text-xs font-semibold text-oko-subtle tracking-widest uppercase mb-4">{title}</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {items.map((f) => (
                    <FilmographyCard key={f.id} item={f} showCharacter={showCharacter} />
                ))}
            </div>
        </section>
    );
}

// ─── Individual poster card ───────────────────────────────────────────────────
function FilmographyCard({ item, showCharacter }) {
    const { movie, characterName } = item;
    const navigate  = useNavigate();
    const [syncing, setSyncing] = useState(false);

    if (!movie) return null;

    // movie.id here is the local DB id from the filmography endpoint
    const handleClick = async () => {
        if (syncing) return;
        // filmography returns movie.id as local DB id — navigate directly
        if (movie.id) {
            navigate(`/movies/${movie.id}`);
            return;
        }
        // fallback: sync via tmdbId if local id missing
        if (movie.tmdbId) {
            setSyncing(true);
            try {
                const { data } = await syncMovie(movie.tmdbId);
                navigate(`/movies/${data.id}`);
            } catch {} finally { setSyncing(false); }
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group relative rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
            {syncing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <OkoSpinner size={24} />
                </div>
            )}

            {/* Poster */}
            <div className="aspect-[2/3] bg-oko-surface overflow-hidden">
                {movie.posterUrl ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-oko-faint text-xs text-center p-2">
                        {movie.title}
                    </div>
                )}

                {/* Character name tooltip on hover */}
                {showCharacter && characterName && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        <p className="text-[10px] text-white leading-tight line-clamp-2">{characterName}</p>
                    </div>
                )}
            </div>

            {/* Info strip */}
            <div className="bg-oko-surface px-2 py-1.5">
                <p className="text-xs font-medium text-oko-text truncate">{movie.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-oko-subtle">{movie.releaseYear}</span>
                    {movie.averageRating > 0 && <StarDisplay rating={movie.averageRating} size="xs" />}
                </div>
            </div>
        </div>
    );
}