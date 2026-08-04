import { useMemo } from 'react';
import './RomanticParticles.css';

const PARTICLE_SYMBOLS = ['💖', '✨', '🌸', '⭐', '💕'];

export default function RomanticParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      symbol: PARTICLE_SYMBOLS[i % PARTICLE_SYMBOLS.length],
      left: `${(i * 7.2 + (i % 3) * 2.5) % 95}%`,
      animationDuration: `${12 + (i % 6) * 3}s`,
      animationDelay: `${(i % 5) * 2}s`,
      size: `${12 + (i % 4) * 4}px`
    }));
  }, []);

  return (
    <div className="romantic-particles-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="romantic-particle"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            fontSize: p.size
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
