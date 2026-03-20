import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, EyeIcon, BookmarkIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchMovies, filterMovies, syncMovie, markWatched, unmarkWatched, addToWatchlist, removeFromWatchlist } from '../../api';
import { OkoSpinner } from '../../components/Logo';
import { StarDisplay } from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';

const GENRES = [
  { label: 'Action',        value: 'Action' },
  { label: 'Animation',     value: 'Animation' },
  { label: 'Comedy',        value: 'Comedy' },
  { label: 'Crime',         value: 'Crime' },
  { label: 'Documentary',   value: 'Documentary' },
  { label: 'Drama',         value: 'Drama' },
  { label: 'Fantasy',       value: 'Fantasy' },
  { label: 'Horror',        value: 'Horror' },
  { label: 'Mystery',       value: 'Mystery' },
  { label: 'Romance',       value: 'Romance' },
  { label: 'Sci-Fi',        value: 'Science Fiction' },
  { label: 'Thriller',      value: 'Thriller' },
  { label: 'History',       value: 'History' },
  { label: 'Music',         value: 'Music' },
  { label: 'War',           value: 'War' },
  { label: 'Western',       value: 'Western' },
];
const LANGUAGES = [
  { code: '', label: 'Any' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
];

// ─── Global sync cache ────────────────────────────────────────────────────────
// Stores either a pending Promise or the resolved local DB id for each tmdbId.
// This means no matter how many things try to sync the same movie at the same
// time (tile click + button click, double-click, two tabs, etc.) only ONE
// request is ever sent. Everyone else just waits for the same promise.
const syncCache = {};

function getOrSyncMovie(tmdbId) {
  if (syncCache[tmdbId]) return Promise.resolve(syncCache[tmdbId]);

  const promise = syncMovie(tmdbId)
      .then(({ data }) => {
        syncCache[tmdbId] = data.id; // replace promise with the resolved id
        return data.id;
      })
      .catch((err) => {
        delete syncCache[tmdbId]; // on failure, allow retry next time
        throw err;
      });

  syncCache[tmdbId] = promise; // store promise so concurrent calls share it
  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQ     = searchParams.get('q')     || '';
  const initialGenre = searchParams.get('genre') || '';

  const [query,       setQuery]       = useState(initialQ);
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [syncing,     setSyncing]     = useState(null);
  const [error,       setError]       = useState('');
  const [showFilters, setShowFilters] = useState(!!initialGenre);

  const [genre,    setGenre]    = useState(initialGenre);
  const [year,     setYear]     = useState('');
  const [language, setLanguage] = useState('');

  const hasFilters = genre || year || language;

  useEffect(() => {
    if (initialGenre) doFilterSearch(initialQ, initialGenre, year, language);
    else if (initialQ) doSearch(initialQ);
  }, []); // eslint-disable-line

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await searchMovies(q);
      setResults(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setError('Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const doFilterSearch = async (title, genreVal, yearVal, langVal) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (title)    params.title    = title;
      if (genreVal) params.genre    = genreVal;
      if (yearVal)  params.year     = yearVal;
      if (langVal)  params.language = langVal;
      const { data } = await filterMovies(params);
      setResults(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setError('Filter search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (genre)        params.genre = genre;
    setSearchParams(params);
    if (hasFilters) doFilterSearch(query, genre, year, language);
    else            doSearch(query);
  };

  const handleFilterChange = (newGenre, newYear, newLang) => {
    const g = newGenre ?? genre;
    const y = newYear  ?? year;
    const l = newLang  ?? language;
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (g) params.genre = g;
    setSearchParams(params);
    doFilterSearch(query, g, y, l);
  };

  const clearFilters = () => {
    setGenre(''); setYear(''); setLanguage('');
    const params = {};
    if (query.trim()) params.q = query.trim();
    setSearchParams(params);
    if (query.trim()) doSearch(query);
    else setResults([]);
  };

  const handleMovieClick = async (movie) => {
    const tmdbId = movie.tmdbId ?? movie.id;

    // Local DB movie (from filter search) — navigate directly, no sync needed
    if (movie.posterUrl && !movie.poster_path && movie.id) {
      navigate(`/movies/${movie.id}`, { state: { tmdbId } });
      return;
    }

    setSyncing(tmdbId);
    setError('');
    try {
      const localId = await getOrSyncMovie(tmdbId);
      navigate(`/movies/${localId}`, { state: { tmdbId } });
    } catch {
      setError('Could not load this film. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  const selectLabel = "bg-oko-surface border border-oko-border rounded-lg px-3 py-2 text-sm text-oko-text focus:outline-none focus:border-oko-red transition-colors cursor-pointer";

  return (
      <div className="max-w-7xl mx-auto px-6 py-8">

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oko-subtle pointer-events-none" />
              <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a film…"
                  className="w-full bg-oko-surface border border-oko-border rounded-xl pl-12 pr-4 py-3 text-base text-oko-text placeholder-oko-subtle focus:outline-none focus:border-oko-red transition-colors"
              />
            </div>
            <button type="submit"
                    className="bg-oko-red hover:bg-oko-red-dark text-white text-sm font-medium px-5 rounded-xl transition-colors">
              Search
            </button>
            <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-4 rounded-xl border text-sm transition-colors ${
                    showFilters || hasFilters
                        ? 'bg-oko-red/10 border-oko-red text-oko-red'
                        : 'bg-oko-surface border-oko-border text-oko-muted hover:border-oko-muted hover:text-oko-text'
                }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-oko-red" />}
            </button>
          </div>
        </form>

        {showFilters && (
            <div className="bg-oko-surface border border-oko-border rounded-xl p-4 mb-6 animate-fade-in">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-oko-subtle">Genre</label>
                  <select value={genre} onChange={(e) => { setGenre(e.target.value); handleFilterChange(e.target.value, null, null); }} className={selectLabel}>
                    <option value="">Any genre</option>
                    {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-oko-subtle">Year</label>
                  <select value={year} onChange={(e) => { setYear(e.target.value); handleFilterChange(null, e.target.value, null); }} className={selectLabel}>
                    <option value="">Any year</option>
                    <optgroup label="Recent">
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </optgroup>
                    <optgroup label="2010s">
                      {Array.from({ length: 10 }, (_, i) => 2019 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </optgroup>
                    <optgroup label="2000s">
                      {Array.from({ length: 10 }, (_, i) => 2009 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </optgroup>
                    <optgroup label="1990s">
                      {Array.from({ length: 10 }, (_, i) => 1999 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </optgroup>
                    <optgroup label="1980s">
                      {Array.from({ length: 10 }, (_, i) => 1989 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </optgroup>
                    <optgroup label="Older">
                      {Array.from({ length: 6 }, (_, i) => 1979 - i * 10).map((y) => <option key={y} value={y}>{y}s</option>)}
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-oko-subtle">Language</label>
                  <select value={language} onChange={(e) => { setLanguage(e.target.value); handleFilterChange(null, null, e.target.value); }} className={selectLabel}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>

                {hasFilters && (
                    <button type="button" onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-oko-muted hover:text-oko-red transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                      Clear filters
                    </button>
                )}
              </div>

              {genre && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs bg-oko-red/10 text-oko-red border border-oko-red/30 rounded-full px-3 py-1">
                      {GENRES.find(g => g.value === genre)?.label ?? genre}
                      <button onClick={() => { setGenre(''); handleFilterChange('', null, null); }} className="hover:text-white"><XMarkIcon className="w-3 h-3" /></button>
                    </span>
                    {language && (
                        <span className="flex items-center gap-1.5 text-xs bg-oko-surface text-oko-muted border border-oko-border rounded-full px-3 py-1">
                          {LANGUAGES.find(l => l.code === language)?.label}
                          <button onClick={() => { setLanguage(''); handleFilterChange(null, null, ''); }} className="hover:text-oko-red"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                    )}
                    {year && (
                        <span className="flex items-center gap-1.5 text-xs bg-oko-surface text-oko-muted border border-oko-border rounded-full px-3 py-1">
                          {year}
                          <button onClick={() => { setYear(''); handleFilterChange(null, '', null); }} className="hover:text-oko-red"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                    )}
                  </div>
              )}
            </div>
        )}

        {error && <p className="text-oko-red text-sm mb-6">{error}</p>}

        {loading && <div className="flex justify-center py-16"><OkoSpinner size={56} /></div>}

        {!loading && results.length === 0 && (initialQ || hasFilters) && (
            <p className="text-oko-subtle text-sm text-center py-16">No results found</p>
        )}

        {!loading && results.length === 0 && !initialQ && !hasFilters && (
            <div className="text-center py-16">
              <p className="text-oko-muted text-sm">Search for films or select a genre to browse</p>
            </div>
        )}

        {results.length > 0 && (
            <>
              <p className="text-xs text-oko-subtle mb-4">{results.length} results</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {results.map((movie) => (
                    <SearchTile
                        key={movie.id ?? movie.tmdbId}
                        movie={movie}
                        syncing={syncing === (movie.tmdbId ?? movie.id)}
                        onClick={() => handleMovieClick(movie)}
                    />
                ))}
              </div>
            </>
        )}
      </div>
  );
}

function SearchTile({ movie, syncing, onClick }) {
  const { user }      = useAuth();
  const title         = movie.title;
  const releaseYear   = movie.release_date ? movie.release_date.slice(0, 4) : (movie.releaseYear ?? '');
  const averageRating = movie.averageRating ?? 0;
  const posterUrl     = movie.posterUrl
      ?? (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);

  const isLocalMovie = movie.posterUrl && !movie.poster_path;
  const [localId,       setLocalId]       = useState(isLocalMovie ? movie.id : null);
  const [watched,       setWatched]       = useState(false);
  const [inWatchlist,   setInWatchlist]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Uses the global syncCache so if the tile click already started a sync,
  // the button action joins the same promise instead of firing a new request.
  const resolveLocalId = async () => {
    if (localId) return localId;
    const tmdbId = movie.tmdbId ?? movie.id;
    const id = await getOrSyncMovie(tmdbId);
    setLocalId(id);
    return id;
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
          onClick={onClick}
          className={`group text-left rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${syncing ? 'opacity-60 cursor-wait' : ''}`}
      >
        <div className="aspect-[2/3] bg-oko-surface relative overflow-hidden">
          {syncing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <OkoSpinner size={32} />
              </div>
          )}
          {posterUrl ? (
              <img src={posterUrl} alt={title}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   loading="lazy" />
          ) : (
              <div className="w-full h-full flex items-center justify-center p-2 text-oko-faint text-xs text-center">
                {title}
              </div>
          )}
          {user && !syncing && (
              <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
                <button
                    onClick={handleWatched}
                    disabled={!!actionLoading}
                    title={watched ? 'Unmark watched' : 'Mark as watched'}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${watched ? 'bg-green-700/90 text-green-100' : 'bg-black/70 text-white hover:bg-green-700/90 backdrop-blur-sm'}`}
                >
                  {actionLoading === 'watched' ? <OkoSpinner size={12} /> : <EyeIcon className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={handleWatchlist}
                    disabled={!!actionLoading}
                    title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 ${inWatchlist ? 'bg-teal-700/90 text-teal-100' : 'bg-black/70 text-white hover:bg-teal-700/90 backdrop-blur-sm'}`}
                >
                  {actionLoading === 'watchlist' ? <OkoSpinner size={12} /> : <BookmarkIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
          )}
        </div>
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