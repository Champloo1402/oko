import React from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from '../StarRating';

const TYPE_LABEL = {
  REVIEW:  'reviewed',
  DIARY:   'logged',
  WATCHED: 'watched',
};
const TYPE_COLOR = {
  REVIEW:  'text-oko-red border-oko-red/30',
  DIARY:   'text-purple-400 border-purple-400/30',
  WATCHED: 'text-oko-muted border-oko-border',
};

export default function FeedItem({ item }) {
  const { type, username, avatarUrl, movie, rating, content, timestamp } = item;

  return (
      <div className="flex gap-4 py-5 border-b border-oko-surface last:border-0 animate-fade-in">
        {/* Avatar */}
        <Link to={`/users/${username}`} className="flex-shrink-0 mt-0.5">
          {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full object-cover" style={{ width: '2rem', height: '2rem' }} />
          ) : (
              <div className="w-8 h-8 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-xs font-semibold uppercase">
                {username[0]}
              </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Action line */}
          <p className="text-sm text-oko-muted mb-2">
            <Link to={`/users/${username}`} className="font-medium text-oko-text hover:text-oko-red transition-colors">
              {username}
            </Link>
            {' '}{TYPE_LABEL[type] || 'interacted with'}{' '}
            <Link to={`/movies/${movie?.id}`} className="font-medium text-oko-text hover:text-oko-red transition-colors">
              {movie?.title}
            </Link>
            {' '}
            <span className={`inline-block text-[10px] border rounded px-1.5 py-0.5 ${TYPE_COLOR[type]}`}>
            {type?.toLowerCase()}
          </span>
          </p>

          {/* Poster + detail */}
          <div className="flex gap-3">
            {movie?.posterUrl && (
                <Link to={`/movies/${movie.id}`} className="flex-shrink-0">
                  <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-12 h-[72px] object-cover rounded border border-oko-border hover:border-oko-red transition-colors"
                  />
                </Link>
            )}

            <div className="flex-1 min-w-0">
              {rating && <StarDisplay rating={rating} size="xs" />}
              {content && (
                  <p className="text-xs text-oko-muted leading-relaxed mt-1 line-clamp-3">{content}</p>
              )}
              <p className="text-[11px] text-oko-faint mt-2">
                {timestamp ? new Date(timestamp).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                }) : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}