import { useState } from 'react';
import { triggerHapticFeedback } from '../../utils/hapticUtils';
import styles from './PunishmentWheelModal.module.css';

export default function PunishmentWheelModal({ activeChallenge, onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!activeChallenge) return null;

  const handleSpin = () => {
    if (spinning || revealed) return;

    setSpinning(true);
    triggerHapticFeedback('heavy');

    // Girar a roleta 5 voltas completas + ângulo aleatório
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setRevealed(true);
      triggerHapticFeedback('success');
    }, 3000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>
          🎡 ROLETA DE CASTIGOS IA
        </h3>

        {!revealed ? (
          <>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
              👑 <strong>{activeChallenge.winner}</strong> venceu a partida! Girando a roleta para sortear o castigo de <strong>{activeChallenge.loser}</strong>...
            </p>

            <div className={styles.wheelContainer}>
              <div className={styles.wheelPointer}>👇</div>
              <svg
                className={styles.wheelSvg}
                viewBox="0 0 100 100"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <circle cx="50" cy="50" r="48" fill="#1e1028" stroke="#ff4d8d" strokeWidth="4" />
                <path d="M50 50 L50 2 A48 48 0 0 1 98 50 Z" fill="#ff4d8d" opacity="0.8" />
                <path d="M50 50 L98 50 A48 48 0 0 1 50 98 Z" fill="#3b82f6" opacity="0.8" />
                <path d="M50 50 L50 98 A48 48 0 0 1 2 50 Z" fill="#10b981" opacity="0.8" />
                <path d="M50 50 L2 50 A48 48 0 0 1 50 2 Z" fill="#f59e0b" opacity="0.8" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
              </svg>
            </div>

            <button
              className={styles.spinBtn}
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? '🌀 A GIRAR A ROLETA...' : '🎡 GIRAR ROLETA!'}
            </button>
          </>
        ) : (
          <div className={styles.resultBox}>
            <div style={{ fontSize: '0.85rem', color: '#ff4d8d', fontWeight: 900, marginBottom: '0.5rem' }}>
              😈 CASTIGO SORTEADO PARA {activeChallenge.loser.toUpperCase()}:
            </div>

            <div className={styles.resultText}>
              "{activeChallenge.challengeText}"
            </div>

            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1.25rem' }}>
              🤖 Gerado por IA Gemini • Cumprimento Obrigatório!
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              ✅ Aceitar e Cumprir!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
