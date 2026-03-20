import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerson, getFilmography, syncMovie, markWatched, unmarkWatched, addToWatchlist, removeFromWatchlist } from '../../api';
import { OkoSpinner } from '../../components/Logo';
import { StarDisplay } from '../../components/StarRating';
import { EyeIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// ─── Global sync cache ────────────────────────────────────────────────────────
const syncCache = {};

function getOrSyncMovie(tmdbId) {
    if (syncCache[tmdbId]) return Promise.resolve(syncCache[tmdbId]);

    const promise = syncMovie(tmdbId)
        .then(({ data }) => {
            syncCache[tmdbId] = data.id;
            return data.id;
        })
        .catch((err) => {
            delete syncCache[tmdbId];
            throw err;
        });

    syncCache[tmdbId] = promise;
    return promise;
}

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function fetchTmdbFilmography(personId) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await axios.get(
        `${apiBase}/api/people/${personId}/tmdb-filmography`,
        { headers }
    );
    return data;
}

export default function PersonDetail() {
    const { id } = useParams();
    const [person,           setPerson]           = useState(null);
    const [loading,          setLoading]          = useState(true);
    const [error,            setError]            = useState('');
    const [localFilmography, setLocalFilmography] = useState([]);
    const [tmdbCast,         setTmdbCast]         = useState([]);
    const [tmdbCrew,         setTmdbCrew]         = useState([]);
    const [tmdbLoading,      setTmdbLoading]      = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [pRes, fRes] = await Promise.all([getPerson(id), getFilmography(id)]);
                setPerson(pRes.data);
                setLocalFilmography(fRes.data ?? []);
            } catch {
                setError('Could not load this person.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    useEffect(() => {
        setTmdbLoading(true);
        fetchTmdbFilmography(id)
            .then((data) => { setTmdbCast(data.cast ?? []); setTmdbCrew(data.crew ?? []); })
            .catch(() => {})
            .finally(() => setTmdbLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={56} /></div>;
    if (error)   return <div className="text-center py-24 text-oko-red text-sm">{error}</div>;
    if (!person) return null;

    localFilmography.forEach((f) => {
        if (f.movie?.tmdbId && f.movie?.id) syncCache[f.movie.tmdbId] = f.movie.id;
    });

    const localActed    = localFilmography.filter((f) => f.roleType === 'ACTOR');
    const localDirected = localFilmography.filter((f) => f.roleType === 'DIRECTOR');
    const localWritten  = localFilmography.filter((f) => f.roleType === 'WRITER');

    const localActedTmdbIds    = new Set(localActed.map((f) => f.movie?.tmdbId));
    const localDirectedTmdbIds = new Set(localDirected.map((f) => f.movie?.tmdbId));
    const localWrittenTmdbIds  = new Set(localWritten.map((f) => f.movie?.tmdbId));

    const tmdbOnlyCast     = tmdbCast.filter((m) => m.id && !localActedTmdbIds.has(m.id));
    const tmdbOnlyDirected = tmdbCrew.filter((m) => m.job === 'Director' && m.id && !localDirectedTmdbIds.has(m.id));
    const tmdbOnlyWritten  = tmdbCrew.filter((m) => (m.job === 'Writer' || m.job === 'Screenplay') && m.id && !localWrittenTmdbIds.has(m.id));

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
            <div className="flex gap-8 mb-12">
                <div className="flex-shrink-0 w-36 md:w-48">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-oko-border bg-oko-surface">
                        {person.photoUrl
                            ? <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover object-top" />
                            : <div className="w-full h-full flex items-center justify-center text-oko-faint text-4xl">◉</div>
                        }
                    </div>
                </div>
                <div className="flex-1 pt-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-oko-text mb-4">{person.name}</h1>
                    {person.biography
                        ? <p className="text-sm text-oko-muted leading-relaxed line-clamp-[10]">{person.biography}</p>
                        : <p className="text-sm text-oko-subtle italic">No biography available.</p>
                    }
                </div>
            </div>

            {(localActed.length > 0 || tmdbOnlyCast.length > 0) && (
                <FilmSection title="Actor in" localItems={localActed} tmdbItems={tmdbOnlyCast} showCharacter loading={tmdbLoading} />
            )}
            {(localDirected.length > 0 || tmdbOnlyDirected.length > 0) && (
                <FilmSection title="Directed" localItems={localDirected} tmdbItems={tmdbOnlyDirected} loading={tmdbLoading} />
            )}
            {(localWritten.length > 0 || tmdbOnlyWritten.length > 0) && (
                <FilmSection title="Written by" localItems={localWritten} tmdbItems={tmdbOnlyWritten} loading={tmdbLoading} />
            )}
        </div>
    );
}

function FilmSection({ title, localItems, tmdbItems, showCharacter = false, loading }) {
    return (
        <section className="mb-10">
            <h2 className="text-xs font-semibold text-oko-subtle tracking-widest uppercase mb-4 flex items-center gap-2">
                {title}
                {loading && <OkoSpinner size={12} />}
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {localItems.map((f) => (
                    <FilmCard
                        key={f.id}
                        tmdbId={f.movie?.tmdbId}
                        localId={f.movie?.id}
                        title={f.movie?.title}
                        posterUrl={f.movie?.posterUrl}
                        releaseYear={f.movie?.releaseYear}
                        averageRating={f.movie?.averageRating}
                        characterName={showCharacter ? f.characterName : null}
                    />
                ))}
                {tmdbItems.map((m) => (
                    <FilmCard
                        key={m.id}
                        tmdbId={m.id}
                        localId={null}
                        title={m.title}
                        posterUrl={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null}
                        releaseYear={m.release_date ? m.release_date.slice(0, 4) : ''}
                        averageRating={null}
                        characterName={showCharacter ? m.character : null}
                    />
                ))}
            </div>
        </section>
    );
}

function FilmCard({ tmdbId, localId: initialLocalId, title, posterUrl, releaseYear, averageRating, characterName }) {
    const navigate = useNavigate();
    const { user }  = useAuth();

    const [localId,       setLocalId]       = useState(initialLocalId);
    const [syncing,       setSyncing]       = useState(false);
    const [failed,        setFailed]        = useState(false);
    const [watched,       setWatched]       = useState(false);
    const [inWatchlist,   setInWatchlist]   = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const resolveLocalId = async () => {
        if (localId) return localId;
        const id = await getOrSyncMovie(tmdbId);
        setLocalId(id);
        return id;
    };

    const handleClick = async () => {
        if (syncing || actionLoading) return;
        setSyncing(true);
        setFailed(false);
        try {
            const id = await resolveLocalId();
            navigate(`/movies/${id}`, { state: { tmdbId } });
        } catch {
            setFailed(true);
            setSyncing(false);
        }
    };

    const handleWatched = async (e) => {
        e.stopPropagation();
        if (actionLoading) return;
        setActionLoading('watched');
        try {
            const id = await resolveLocalId();
            if (watched) { await unmarkWatched(id); setWatched(false); }
            else         { await markWatched(id);   setWatched(true);  }
        } catch {}
        finally { setActionLoading(null); }
    };

    const handleWatchlist = async (e) => {
        e.stopPropagation();
        if (actionLoading) return;
        setActionLoading('watchlist');
        try {
            const id = await resolveLocalId();
            if (inWatchlist) { await removeFromWatchlist(id); setInWatchlist(false); }
            else             { await addToWatchlist(id);      setInWatchlist(true);  }
        } catch {}
        finally { setActionLoading(null); }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative rounded-md overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                failed ? 'border-oko-red/50 opacity-60' : 'border-oko-border hover:border-oko-red'
            }`}
        >
            {/* FIX: overflow-hidden on the poster div keeps everything inside it */}
            <div className="aspect-[2/3] bg-oko-surface relative overflow-hidden">
                {syncing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <OkoSpinner size={24} />
                    </div>
                )}

                {posterUrl ? (
                    <img src={posterUrl} alt={title}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-oko-faint text-xs text-center p-2">
                        {title}
                    </div>
                )}

                {/* Buttons at the bottom of the poster, slide up from within */}
                {user && !syncing && (
                    <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
                        {/* Character name strip — sits above the buttons */}
                        {characterName && (
                            <div className="bg-gradient-to-t from-black/90 to-transparent px-2 pt-4 pb-1">
                                <p className="text-[10px] text-white leading-tight line-clamp-2">{characterName}</p>
                            </div>
                        )}
                        {/* Action buttons */}
                        <div className="flex gap-1 p-1.5 bg-black/20">
                            <button
                                onClick={handleWatched}
                                disabled={!!actionLoading}
                                title={watched ? 'Unmark watched' : 'Mark as watched'}
                                className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                                    watched ? 'bg-green-700/90 text-green-100' : 'bg-black/70 text-white hover:bg-green-700/90 backdrop-blur-sm'
                                }`}
                            >
                                {actionLoading === 'watched' ? <OkoSpinner size={12} /> : <EyeIcon className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={handleWatchlist}
                                disabled={!!actionLoading}
                                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                                className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                                    inWatchlist ? 'bg-teal-700/90 text-teal-100' : 'bg-black/70 text-white hover:bg-teal-700/90 backdrop-blur-sm'
                                }`}
                            >
                                {actionLoading === 'watchlist' ? <OkoSpinner size={12} /> : <BookmarkIcon className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Title strip below poster — never covered by buttons */}
            <div className="bg-oko-surface px-2 py-1.5">
                <p className="text-xs font-medium text-oko-text truncate">{title}</p>
                <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-oko-subtle">{releaseYear}</span>
                    {averageRating > 0 && <StarDisplay rating={averageRating} size="xs" />}
                </div>
            </div>
        </div>
    );
}