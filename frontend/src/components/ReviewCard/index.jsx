import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from '../StarRating';
import { useAuth } from '../../context/AuthContext';

export default function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [deleted,  setDeleted]  = useState(false);

  if (deleted) return null;

  const {
    id, username, avatarUrl, rating, content,
    isSpoiler, createdAt,
  } = review;

  const handleDelete = async () => {
    if (!window.confirm('Delete this review?')) return;
    onDelete?.(id);
    setDeleted(true);
  };

  return (
    <div className="bg-oko-surface border border-oko-border rounded-lg p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/users/${username}`} className="flex items-center gap-2 group">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-xs font-semibold uppercase">
              {username[0]}
            </div>
          )}
          <span className="text-sm font-medium text-oko-text group-hover:text-oko-red transition-colors">
            {username}
          </span>
        </Link>

        {rating && <StarDisplay rating={rating} size="xs" />}

        <span className="ml-auto text-xs text-oko-subtle">
          {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        {user?.username === username && (
          <button
            onClick={handleDelete}
            className="text-xs text-oko-faint hover:text-oko-red transition-colors ml-2"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      {isSpoiler && !revealed ? (
        <div className="relative">
          <p className="text-sm text-oko-muted leading-relaxed spoiler-blur select-none">
            {content}
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-oko-text bg-black/30 rounded"
          >
            ⚠ Reveal spoiler
          </button>
        </div>
      ) : (
        <p className="text-sm text-oko-muted leading-relaxed">{content}</p>
      )}

      {isSpoiler && (
        <span className="inline-block mt-2 text-[10px] text-oko-red border border-oko-red/30 rounded px-1.5 py-0.5">
          spoiler
        </span>
      )}
    </div>
  );
}
