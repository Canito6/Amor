import { createContext, useState, useEffect, useContext } from 'react';

const AppLockContext = createContext();

export function AppLockProvider({ children }) {
  const [pinEnabled, setPinEnabled] = useState(() => localStorage.getItem('appLockEnabled') === 'true');
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem('appLockPin') || '');
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => localStorage.getItem('appLockBiometrics') === 'true');
  const [isLocked, setIsLocked] = useState(() => {
    const enabled = localStorage.getItem('appLockEnabled') === 'true';
    const pin = localStorage.getItem('appLockPin');
    return !!(enabled && pin);
  });

  const isBiometricsSupported = typeof window !== 'undefined' && 
    window.PublicKeyCredential && 
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

  const enablePin = (pin) => {
    if (pin && pin.length === 4) {
      setSavedPin(pin);
      setPinEnabled(true);
      localStorage.setItem('appLockPin', pin);
      localStorage.setItem('appLockEnabled', 'true');
      setIsLocked(true);
    }
  };

  const disablePin = () => {
    setPinEnabled(false);
    setSavedPin('');
    setBiometricsEnabled(false);
    setIsLocked(false);
    localStorage.removeItem('appLockPin');
    localStorage.removeItem('appLockEnabled');
    localStorage.removeItem('appLockBiometrics');
  };

  const toggleBiometrics = (enabled) => {
    setBiometricsEnabled(enabled);
    if (enabled) {
      localStorage.setItem('appLockBiometrics', 'true');
    } else {
      localStorage.removeItem('appLockBiometrics');
    }
  };

  // Bloquear automaticamente quando a app é reaberta ou regressa do segundo plano (minimize/switch em mobile)
  useEffect(() => {
    const handleReopen = () => {
      const enabled = localStorage.getItem('appLockEnabled') === 'true';
      const pin = localStorage.getItem('appLockPin');
      if (enabled && pin) {
        setIsLocked(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReopen();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReopen);
    window.addEventListener('pageshow', handleReopen);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReopen);
      window.removeEventListener('pageshow', handleReopen);
    };
  }, []);

  const unlockApp = (pin) => {
    const currentSavedPin = savedPin || localStorage.getItem('appLockPin');
    if (pin === currentSavedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async () => {
    if (!isBiometricsSupported) return false;
    try {
      // Usar WebAuthn para acionar o Face ID / Touch ID nativo do dispositivo
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const options = {
        publicKey: {
          challenge,
          rp: { name: "AMORI" },
          user: {
            id: new Uint8Array(16),
            name: "amori_user",
            displayName: "Utilizador AMORI"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      };

      const credential = await navigator.credentials.create(options);
      if (credential) {
        setIsLocked(false);
        return true;
      }
    } catch (err) {
      console.warn("Autenticação biométrica não concluída ou cancelada:", err);
    }
    return false;
  };

  const lockApp = () => {
    if (pinEnabled && savedPin) {
      setIsLocked(true);
    }
  };

  return (
    <AppLockContext.Provider value={{
      pinEnabled,
      isLocked,
      biometricsEnabled,
      isBiometricsSupported,
      enablePin,
      disablePin,
      toggleBiometrics,
      unlockApp,
      unlockWithBiometrics,
      lockApp
    }}>
      {children}
    </AppLockContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppLock = () => useContext(AppLockContext);
