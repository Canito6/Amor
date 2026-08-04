export const triggerHapticFeedback = (type = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in window.navigator) {
    try {
      if (type === 'light') {
        window.navigator.vibrate(25);
      } else if (type === 'medium') {
        window.navigator.vibrate(50);
      } else if (type === 'heavy') {
        window.navigator.vibrate([40, 60, 80]);
      } else if (type === 'success') {
        window.navigator.vibrate([30, 50, 30, 50, 100]);
      } else if (type === 'error') {
        window.navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Ignorar navegadores que restringem vibração
    }
  }
};
