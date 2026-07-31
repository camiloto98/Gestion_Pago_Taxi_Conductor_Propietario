import { useEffect, useState } from 'react';

function TaxiOutline({ style, className = '', compact = false }) {
  const w = compact ? 140 : 200;
  const h = compact ? 63 : 90;

  return (
    <svg
      className={`tech-bg__taxi ${className}`}
      style={style}
      width={w}
      height={h}
      viewBox="0 0 220 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 62c2-14 12-28 26-30l66-10c14-2 32 6 40 18l10 22h14c8 0 14 6 14 14v8H20v-6c0-10 8-16 20-16h0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M66 40h82" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <rect x="72" y="44" width="28" height="14" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <rect x="108" y="44" width="28" height="14" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="60" cy="82" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="156" cy="82" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="82" r="4" fill="currentColor" opacity="0.25" />
      <circle cx="156" cy="82" r="4" fill="currentColor" opacity="0.25" />
      <rect x="108" y="28" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

const SPARKLES = [
  { top: '6%', left: '10%', delay: '0s', size: 3, star: false },
  { top: '12%', left: '76%', delay: '0.9s', size: 4, star: true },
  { top: '18%', left: '42%', delay: '1.8s', size: 2, star: false },
  { top: '24%', left: '91%', delay: '0.5s', size: 3, star: false },
  { top: '30%', left: '5%', delay: '2.6s', size: 2, star: true },
  { top: '36%', left: '58%', delay: '1.2s', size: 4, star: false },
  { top: '40%', left: '28%', delay: '3.1s', size: 3, star: true },
  { top: '44%', left: '84%', delay: '0.3s', size: 2, star: false },
  { top: '50%', left: '14%', delay: '2.1s', size: 3, star: false },
  { top: '52%', left: '68%', delay: '3.8s', size: 4, star: true },
  { top: '58%', left: '38%', delay: '1.5s', size: 2, star: false },
  { top: '62%', left: '94%', delay: '2.9s', size: 3, star: false },
  { top: '66%', left: '8%', delay: '0.7s', size: 2, star: true },
  { top: '70%', left: '52%', delay: '4.1s', size: 3, star: false },
  { top: '74%', left: '24%', delay: '1.9s', size: 4, star: true },
  { top: '78%', left: '72%', delay: '3.4s', size: 2, star: false },
  { top: '82%', left: '44%', delay: '0.2s', size: 3, star: false },
  { top: '86%', left: '16%', delay: '2.4s', size: 2, star: true },
  { top: '88%', left: '62%', delay: '1.1s', size: 4, star: false },
  { top: '92%', left: '88%', delay: '3.6s', size: 3, star: true },
  { top: '8%', left: '52%', delay: '2.8s', size: 2, star: false },
  { top: '20%', left: '64%', delay: '4.4s', size: 3, star: true },
  { top: '46%', left: '48%', delay: '0.6s', size: 2, star: false },
  { top: '56%', left: '82%', delay: '3.2s', size: 3, star: false },
  { top: '64%', left: '32%', delay: '1.7s', size: 2, star: true },
  { top: '76%', left: '96%', delay: '2.2s', size: 3, star: false },
  { top: '94%', left: '36%', delay: '4.8s', size: 2, star: true },
  { top: '4%', left: '32%', delay: '3.9s', size: 3, star: false },
  { top: '34%', left: '74%', delay: '1.4s', size: 2, star: true },
  { top: '48%', left: '2%', delay: '4.6s', size: 3, star: false },
];

const BLOCKS = [
  { top: '10%', left: '4%', w: 52, h: 52, delay: '0s' },
  { top: '16%', left: '83%', w: 68, h: 44, delay: '1.5s' },
  { top: '70%', left: '76%', w: 60, h: 60, delay: '2.8s' },
  { top: '78%', left: '8%', w: 44, h: 44, delay: '0.6s' },
  { top: '42%', left: '2%', w: 40, h: 40, delay: '3.2s' },
  { top: '36%', left: '90%', w: 48, h: 48, delay: '1.9s' },
  { top: '62%', left: '46%', w: 36, h: 36, delay: '2.1s' },
  { top: '24%', left: '22%', w: 28, h: 28, delay: '4s' },
  { top: '52%', left: '58%', w: 32, h: 32, delay: '3.5s' },
  { top: '84%', left: '52%', w: 40, h: 24, delay: '1.2s' },
];

const TAXIS = [
  { top: '8%', left: '3%', rotate: '-8deg', scale: 1, delay: '0s', variant: 'tech-bg__taxi--float-a', mobile: true },
  { top: '52%', left: '80%', rotate: '12deg', scale: 0.88, delay: '2s', variant: 'tech-bg__taxi--float-b', mobile: true },
  { top: '76%', left: '15%', rotate: '-4deg', scale: 0.78, delay: '1s', variant: 'tech-bg__taxi--float-c', mobile: true },
  { top: '28%', left: '68%', rotate: '6deg', scale: 0.68, delay: '3s', variant: 'tech-bg__taxi--float-a', mobile: false },
  { top: '86%', left: '58%', rotate: '-10deg', scale: 0.62, delay: '1.5s', variant: 'tech-bg__taxi--float-b', mobile: false },
  { top: '18%', left: '48%', rotate: '3deg', scale: 0.55, delay: '4s', variant: 'tech-bg__taxi--float-c', mobile: false },
  { top: '62%', left: '38%', rotate: '-6deg', scale: 0.5, delay: '2.5s', variant: 'tech-bg__taxi--float-a', mobile: false },
  { top: '38%', left: '12%', rotate: '9deg', scale: 0.58, delay: '3.8s', variant: 'tech-bg__taxi--float-b', mobile: false },
  { top: '92%', left: '78%', rotate: '-12deg', scale: 0.48, delay: '0.8s', variant: 'tech-bg__taxi--float-c', mobile: false },
];

const STREAMS = [
  { top: '22%', width: '18%', left: '0%', delay: '0s', duration: '6s', mobile: true },
  { top: '47%', width: '24%', left: '70%', delay: '2s', duration: '7s', mobile: false },
  { top: '71%', width: '14%', left: '20%', delay: '4s', duration: '5s', mobile: true },
  { top: '58%', width: '20%', left: '45%', delay: '1s', duration: '8s', mobile: false },
];

const CORNERS = ['tl', 'tr', 'bl', 'br'];

function useCompactBg() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return compact;
}

export default function TechBackground() {
  const compact = useCompactBg();

  const sparkles = compact ? SPARKLES.filter((_, i) => i % 2 === 0 || i < 8) : SPARKLES;
  const blocks = compact ? BLOCKS.slice(0, 5) : BLOCKS;
  const taxis = compact ? TAXIS.filter((t) => t.mobile) : TAXIS;
  const streams = compact ? STREAMS.filter((s) => s.mobile) : STREAMS;

  return (
    <div className={`tech-bg${compact ? ' tech-bg--compact' : ''}`} aria-hidden="true">
      <div className="tech-bg__mesh" />
      <div className="tech-bg__orb tech-bg__orb--1" />
      <div className="tech-bg__orb tech-bg__orb--2" />
      <div className="tech-bg__orb tech-bg__orb--3" />
      {!compact && <div className="tech-bg__orb tech-bg__orb--4" />}

      <div className="tech-bg__hex" />
      <div className="tech-bg__grid" />
      <div className="tech-bg__grid-fine" />
      {!compact && <div className="tech-bg__grid-pulse" />}

      {CORNERS.map((c) => (
        <div key={c} className={`tech-bg__corner tech-bg__corner--${c}`} />
      ))}

      {blocks.map((b, i) => (
        <div
          key={`block-${i}`}
          className="tech-bg__block"
          style={{
            top: b.top,
            left: b.left,
            width: compact ? b.w * 0.65 : b.w,
            height: compact ? b.h * 0.65 : b.h,
            animationDelay: b.delay,
          }}
        />
      ))}

      {streams.map((s, i) => (
        <div
          key={`stream-${i}`}
          className="tech-bg__stream"
          style={{
            top: s.top,
            width: s.width,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {taxis.map((t, i) => (
        <div
          key={`taxi-${i}`}
          className={`tech-bg__taxi-wrap ${t.variant}`}
          style={{
            top: t.top,
            left: t.left,
            animationDelay: t.delay,
          }}
        >
          <TaxiOutline
            compact={compact}
            style={{ transform: `rotate(${t.rotate}) scale(${compact ? t.scale * 0.72 : t.scale})` }}
          />
        </div>
      ))}

      {sparkles.map((s, i) => (
        <span
          key={`spark-${i}`}
          className={`tech-bg__sparkle${s.star ? ' tech-bg__sparkle--star' : ''}`}
          style={{
            top: s.top,
            left: s.left,
            width: compact ? Math.max(2, s.size - 1) : s.size,
            height: compact ? Math.max(2, s.size - 1) : s.size,
            animationDelay: s.delay,
          }}
        />
      ))}

      <div className="tech-bg__scanline" />
      {!compact && <div className="tech-bg__noise" />}
      <div className="tech-bg__vignette" />
    </div>
  );
}
