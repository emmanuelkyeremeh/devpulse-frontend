import { useMemo } from 'react';

const STAR_COUNT = 80;

function Star({ delay, duration, size, x, y, drift }) {
  return (
    <span
      className={`absolute rounded-full bg-white ${drift ? 'animate-star-drift' : 'animate-star'}`}
      style={
        drift
          ? {
              left: `${x}%`,
              top: '-10%',
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: size > 1 ? 0.5 : 0.7,
            }
          : {
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: size > 1 ? 0.4 : 0.7,
            }
      }
    />
  );
}

export default function LandingBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      delay: Math.random() * (i < 20 ? 25 : 4),
      duration: i < 20 ? 25 + Math.random() * 10 : 2 + Math.random() * 3,
      size: Math.random() > 0.7 ? 2 : 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      drift: i < 20,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 print:hidden">
      {/* Base dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(30, 41, 59, 0.4), transparent 50%), linear-gradient(180deg, #0c0f14 0%, #0a0d12 100%)',
        }}
      />
      {/* Grid layers — moving like travelling through space */}
      <div
        className="absolute inset-0 opacity-[0.14] animate-grid-move"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08] animate-grid-move-slow"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Subtle center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(34, 211, 238, 0.06), transparent 70%)',
        }}
      />
      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((s) => (
          <Star key={s.id} delay={s.delay} duration={s.duration} size={s.size} x={s.x} y={s.y} drift={s.drift} />
        ))}
      </div>
    </div>
  );
}
