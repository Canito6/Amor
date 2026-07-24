import { createContext, useState, useContext } from 'react';

const AppLockContext = createContext();

export function AppLockProvider({ children }) {
  const [pinEnabled, setPinEnabled] = useState(() => localStorage.getItem('appLockEnabled') === 'true');
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem('appLockPin') || '');
  const [isLocked, setIsLocked] = useState(() => {
    const enabled = localStorage.getItem('appLockEnabled') === 'true';
    const pin = localStorage.getItem('appLockPin');
    return !!(enabled && pin);
  });

  const enablePin = (pin) => {
    if (pin && pin.length === 4) {
      setSavedPin(pin);
      setPinEnabled(true);
      localStorage.setItem('appLockPin', pin);
      localStorage.setItem('appLockEnabled', 'true');
    }
  };

  const disablePin = () => {
    setPinEnabled(false);
    setSavedPin('');
    setIsLocked(false);
    localStorage.removeItem('appLockPin');
    localStorage.removeItem('appLockEnabled');
  };

  const unlockApp = (pin) => {
    if (pin === savedPin) {
      setIsLocked(false);
      return true;
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
      enablePin,
      disablePin,
      unlockApp,
      lockApp
    }}>
      {children}
    </AppLockContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppLock = () => useContext(AppLockContext);
