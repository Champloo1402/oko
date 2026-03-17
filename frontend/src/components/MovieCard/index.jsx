import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarDisplay } from '../StarRating';
import { syncMovie } from '../../api';
import { OkoSpinner } from '../Logo';

export default function MovieCard({ movie, className = '' }) {
  const navigate   = useNavigate();
  const [syncing, setSyncing] = useState(false);

  if (!movie) return null;

  const { title, releaseYear, posterUrl, averageRating } = movie;

  // movie.localId  → already a local DB record, navigate directly
  // otherwise      → movie.tmdbId or movie.id is the TMDB id, must sync first
  const handleClick = async () => {
    if (syncing) return;

    if (movie.localId) {
      navigate(`/movies/${movie.localId}`);
      return;
    }

    const tmdbId = movie.tmdbId ?? movie.id;
    setSyncing(true);
    try {
      const { data } = await syncMovie(tmdbId);
      navigate(`/movies/${data.id}`);
    } catch {
      // sync failed — nothing we can do without a local id
    } finally {
      setSyncing(false);
    }
  };

  return (
      <div
          onClick={handleClick}
          className={`group block rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative ${className}`}
      >
        {/* Syncing overlay */}
        {syncing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-md">
              <OkoSpinner size={28} />
            </div>
        )}

        <div className="aspect-[2/3] bg-oko-surface overflow-hidden">
          {posterUrl ? (
              <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-oko-faint text-xs text-center p-2">
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
      </div>
  );
}