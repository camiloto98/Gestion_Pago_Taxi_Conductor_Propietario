export default function TaxicatorLogo({ size = 38, className = '' }) {
  const id = `logo-glow-${size}`;

  return (
    <svg
      className={`taxicator-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#fff176" />
          <stop offset="45%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#f9a825" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="24" cy="24" r="22" className="taxicator-logo__ring" stroke={`url(#${id}-grad)`} strokeWidth="0.8" opacity="0.35" />
      <circle cx="24" cy="24" r="18" stroke={`url(#${id}-grad)`} strokeWidth="0.5" strokeDasharray="3 4" opacity="0.5" />

      <path
        d="M24 5 L41 14.5 V33.5 L24 43 L7 33.5 V14.5 Z"
        stroke={`url(#${id}-grad)`}
        strokeWidth="1.2"
        fill="rgba(255,215,0,0.06)"
        filter={`url(#${id}-blur)`}
      />

      <path
        d="M12 30c1.5-8 7-14 14-15l28-4c6-1 14 3 17 10l4 12h8c4 0 7 3 7 7v4H8v-3c0-5 4-8 10-8"
        stroke={`url(#${id}-grad)`}
        strokeWidth="1.4"
        strokeLinejoin="round"
        transform="translate(-4, 2) scale(0.72)"
      />

      <rect x="21" y="11" width="6" height="3.5" rx="1" fill={`url(#${id}-grad)`} opacity="0.9" />
      <circle cx="14" cy="33" r="3.5" stroke={`url(#${id}-grad)`} strokeWidth="1.2" />
      <circle cx="34" cy="33" r="3.5" stroke={`url(#${id}-grad)`} strokeWidth="1.2" />
      <circle cx="14" cy="33" r="1.2" fill="#ffd700" opacity="0.6" />
      <circle cx="34" cy="33" r="1.2" fill="#ffd700" opacity="0.6" />

      <path d="M8 20 H14 M34 20 H40 M24 8 V12" stroke="#ffd700" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      <circle cx="8" cy="20" r="1" fill="#ffd700" opacity="0.7" />
      <circle cx="40" cy="20" r="1" fill="#ffd700" opacity="0.7" />
    </svg>
  );
}
