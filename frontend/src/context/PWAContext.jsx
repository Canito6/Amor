import { createContext, useState, useEffect, useContext } from 'react';

const PWAContext = createContext(null);

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // 1. Capture beforeinstallprompt event (Android / Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Detect iOS Safari (not in standalone mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
    const isStandalone = (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    const dismissed = localStorage.getItem('ios-install-prompt-dismissed') === 'true';

    if (isIOS && !isStandalone && !dismissed) {
      setShowIOSPrompt(true);
    }

    // 3. Register Service Worker and monitor updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado:', reg.scope);

          // Check if there is already a waiting SW (e.g. user loaded page after update found but not applied)
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }

          // Listen for new updates installing
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // A new Service Worker is installed and waiting to take control
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('Falha ao registar o Service Worker:', err);
        });

      // Reload all open pages once the new Service Worker skipWaiting completes and takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const dismissIOSPrompt = () => {
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
    setShowIOSPrompt(false);
  };

  const showIOSHelp = () => {
    setShowIOSPrompt(true);
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        updateAvailable,
        showIOSPrompt,
        setShowIOSPrompt,
        installApp,
        updateApp,
        dismissIOSPrompt,
        showIOSHelp
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
