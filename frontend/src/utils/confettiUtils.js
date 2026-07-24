import confetti from 'canvas-confetti';

/**
 * Dispara confetis românticos com corações e cores suaves
 */
export function triggerHeartConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#c589e8']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ff4d6d', '#ff758f', '#ffffff']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#ff4d6d', '#ffd166']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  } catch (err) {
    console.error('Erro ao disparar confetis:', err);
  }
}

/**
 * Dispara explosão festiva de vitória (Jogos, Quizzes, Roleta, Raspadinhas)
 */
export function triggerVictoryConfetti() {
  try {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff4d6d', '#c589e8', '#ffd166', '#88D4F7', '#38ef7d']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff4d6d', '#c589e8', '#ffd166', '#88D4F7', '#38ef7d']
      });
    }, 250);
  } catch (err) {
    console.error('Erro ao disparar explosão de vitória:', err);
  }
}

/**
 * Dispara faíscas mágicas (Frasco de mimos, cartas, roleta)
 */
export function triggerMagicSparkles() {
  try {
    confetti({
      particleCount: 80,
      angle: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd166', '#ff4d6d', '#ffffff', '#c589e8'],
      scalar: 1.2,
      shapes: ['star', 'circle']
    });
  } catch (err) {
    console.error('Erro ao disparar faíscas mágicas:', err);
  }
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
