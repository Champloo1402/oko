import React from 'react';

// size = 'sm' | 'md' | 'lg'
export function OkoLogo({ size = 'md', className = '' }) {
  const scales = { sm: 0.65, md: 1, lg: 1.5 };
  const s = scales[size] ?? 1;
  const w = Math.round(96 * s);
  const h = Math.round(38 * s);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 96 38"
      className={className}
      aria-label="OKO"
    >
      {/* First O = eye — full letterform weight */}
      <circle cx="19" cy="19" r="16"  fill="none" stroke="#e84040" strokeWidth="3.2" />
      <circle cx="19" cy="19" r="12"  fill="#1a0505" />
      <circle cx="19" cy="19" r="7.5" fill="#c42a2a" />
      <circle cx="19" cy="19" r="5.5" fill="none" stroke="#e84040" strokeWidth="0.8" opacity="0.45" />
      <circle cx="19" cy="19" r="3.2" fill="#080101" />
      <circle cx="21"cy="17"  r="1.5" fill="#e5e7eb" opacity="0.75" />

      {/* K — same 3.2 stroke weight */}
      <line x1="43" y1="3"  x2="43" y2="35" stroke="#e5e7eb" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="43" y1="19" x2="57" y2="3"  stroke="#e5e7eb" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="43" y1="19" x2="57" y2="35" stroke="#e5e7eb" strokeWidth="3.2" strokeLinecap="round" />

      {/* Second O — same weight, plain */}
      <circle cx="77" cy="19" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3.2" />
    </svg>
  );
}

// ─── Loading spinner — eye mark with orbiting pupil ───────────────────────
export function OkoSpinner({ size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ display: 'block' }}
      aria-label="Loading"
    >
      <style>{`
        @keyframes oko-orbit {
          from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
        }
        @keyframes oko-blink {
          0%,88%,100% { transform: scaleY(1); }
          93% { transform: scaleY(0.07); }
        }
        .oko-eye-blink {
          transform-origin: 32px 32px;
          animation: oko-blink 3.5s ease-in-out infinite;
        }
        .oko-pupil-orbit {
          transform-origin: 32px 32px;
          animation: oko-orbit 1.8s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
        }
      `}</style>

      <g className="oko-eye-blink">
        {/* Outer ring */}
        <circle cx="32" cy="32" r="29" fill="none" stroke="#e84040" strokeWidth="3.5" />
        {/* Eye fill */}
        <circle cx="32" cy="32" r="24" fill="#120404" />
        {/* Iris */}
        <circle cx="32" cy="32" r="15" fill="#c42a2a" />
        {/* Iris detail */}
        <circle cx="32" cy="32" r="11" fill="none" stroke="#e84040" strokeWidth="1.2" opacity="0.4" />
        {/* Pupil */}
        <circle cx="32" cy="32" r="6.5" fill="#080101" />
      </g>

      {/* Orbiting shine dot */}
      <g className="oko-pupil-orbit">
        <circle cx="32" cy="32" r="3.5" fill="#e5e7eb" opacity="0.9" />
      </g>
    </svg>
  );
}

// ─── Icon only (no K/O wordmark) — for favicons, avatars ──────────────────
export function OkoIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-label="OKO">
      <circle cx="19" cy="19" r="16"  fill="none" stroke="#e84040" strokeWidth="3.2" />
      <circle cx="19" cy="19" r="12"  fill="#1a0505" />
      <circle cx="19" cy="19" r="7.5" fill="#c42a2a" />
      <circle cx="19" cy="19" r="5.5" fill="none" stroke="#e84040" strokeWidth="0.8" opacity="0.45" />
      <circle cx="19" cy="19" r="3.2" fill="#080101" />
      <circle cx="21" cy="17" r="1.5" fill="#e5e7eb" opacity="0.75" />
    </svg>
  );
}
