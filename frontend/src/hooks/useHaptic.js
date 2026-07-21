import { useCallback } from 'react';

/**
 * Custom hook para gerir Haptic Feedback (Vibração) em dispositivos móveis
 */
export function useHaptic() {
  const isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;

  const triggerVibration = useCallback((pattern) => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Ignorar se o browser bloquear a vibração por política de interacção
      }
    }
  }, [isSupported]);

  const triggerLight = useCallback(() => triggerVibration(10), [triggerVibration]);
  const triggerMedium = useCallback(() => triggerVibration(25), [triggerVibration]);
  const triggerHeavy = useCallback(() => triggerVibration(50), [triggerVibration]);
  const triggerSuccess = useCallback(() => triggerVibration([30, 40, 30, 40, 60]), [triggerVibration]);
  const triggerWarning = useCallback(() => triggerVibration([80, 50, 80]), [triggerVibration]);

  return {
    isSupported,
    triggerVibration,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerWarning
  };
}
