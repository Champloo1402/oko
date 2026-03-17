import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchMovies, syncMovie } from '../../api';
import { OkoSpinner } from '../../components/Logo';
import { StarDisplay } from '../../components/StarRating';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQ = searchParams.get('q') || '';
  const [query,   setQuery]   = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(null); // tmdbId currently syncing
  const [error,   setError]   = useState('');

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

  // Run search when URL param changes
  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ]); // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
    doSearch(query);
  };

  // Sync movie to local DB then navigate to detail page
  // TMDB search returns `id` as the tmdbId — must sync to get local DB id
  const handleMovieClick = async (movie) => {
    const tmdbId = movie.id ?? movie.tmdbId;
    setSyncing(tmdbId);
    setError('');
    try {
      const { data } = await syncMovie(tmdbId);
      // data.id is the local DB id — the only id safe to use for all subsequent calls
      navigate(`/movies/${data.id}`);
    } catch {
      setError('Could not load this film. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-xl">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oko-subtle pointer-events-none" />
            <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a film…"
                className="w-full bg-oko-surface border border-oko-border rounded-xl pl-12 pr-4 py-3 text-base text-oko-text placeholder-oko-subtle focus:outline-none focus:border-oko-red transition-colors"
            />
            <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-oko-red hover:bg-oko-red-dark text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {error && <p className="text-oko-red text-sm mb-6">{error}</p>}

        {loading && (
            <div className="flex justify-center py-16">
              <OkoSpinner size={56} />
            </div>
        )}

        {!loading && results.length === 0 && initialQ && (
            <p className="text-oko-subtle text-sm text-center py-16">
              No results for "<span className="text-oko-text">{initialQ}</span>"
            </p>
        )}

        {!loading && results.length === 0 && !initialQ && (
            <div className="text-center py-16">
              <p className="text-oko-muted text-sm">Start typing to search TMDB for films</p>
            </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
            <>
              <p className="text-xs text-oko-subtle mb-4">{results.length} results</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {results.map((movie) => (
                    <SearchTile
                        key={movie.id ?? movie.tmdbId}
                        movie={movie}
                        syncing={syncing === (movie.id ?? movie.tmdbId)}
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
  const { title, releaseYear, averageRating } = movie;
  const posterUrl = movie.posterUrl
      ?? (movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null)
      ?? (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);

  return (
      <button
          onClick={onClick}
          disabled={syncing}
          className="group text-left rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="aspect-[2/3] bg-oko-surface relative overflow-hidden">
          {syncing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <OkoSpinner size={32} />
              </div>
          )}
          {posterUrl ? (
              <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center p-2 text-oko-faint text-xs text-center">
                {title}
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
      </button>
  );
}