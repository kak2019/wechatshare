/** 团子 SVG 占位（无 PNG 时回退） */
export function TuanziAvatarSvg({ className = "size-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="tuanziGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#ffc93c" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="36" r="24" fill="url(#tuanziGrad)" />
      <circle cx="24" cy="32" r="4" fill="#3a2f2a" />
      <circle cx="40" cy="32" r="4" fill="#3a2f2a" />
      <path
        d="M26 42 Q32 48 38 42"
        fill="none"
        stroke="#3a2f2a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="38" rx="4" ry="2.5" fill="#ffb4b4" opacity="0.6" />
      <ellipse cx="42" cy="38" rx="4" ry="2.5" fill="#ffb4b4" opacity="0.6" />
    </svg>
  );
}
