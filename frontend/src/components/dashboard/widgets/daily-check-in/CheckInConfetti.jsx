

export default function CheckInConfetti({ showConfetti, confettiParticles }) {
  if (!showConfetti) return null;

  return (
    <div className="confetti-container">
      {confettiParticles.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            backgroundColor: p.color,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}
