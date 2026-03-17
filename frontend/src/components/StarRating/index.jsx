import React, { useState } from 'react';

// ─── Display only ─────────────────────────────────────────────────────────
export function StarDisplay({ rating = 0, size = 'sm' }) {
  const sizes = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  const cls   = sizes[size] ?? sizes.sm;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} className={`${cls} text-oko-red`}>★</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} className={`${cls} star-half`}>★</span>);
    } else {
      stars.push(<span key={i} className={`${cls} text-oko-border`}>★</span>);
    }
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

// ─── Interactive — half-star increments ───────────────────────────────────
export function StarInput({ value = 0, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const cls = sizes[size] ?? sizes.md;
  const display = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`${cls} cursor-pointer select-none transition-colors`}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const half = e.clientX - rect.left < rect.width / 2;
            setHover(half ? i - 0.5 : i);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const half = e.clientX - rect.left < rect.width / 2;
            onChange(half ? i - 0.5 : i);
          }}
          style={{ color: display >= i ? '#e84040' : display >= i - 0.5 ? undefined : '#374151' }}
        >
          {display >= i
            ? '★'
            : display >= i - 0.5
            ? <HalfStar />
            : '★'}
        </span>
      ))}
      <span className="ml-2 text-sm text-oko-muted">{display > 0 ? display.toFixed(1) : ''}</span>
    </div>
  );
}

function HalfStar() {
  return (
    <span className="relative inline-block">
      <span className="text-oko-border">★</span>
      <span className="absolute inset-0 overflow-hidden w-1/2 text-oko-red">★</span>
    </span>
  );
}
