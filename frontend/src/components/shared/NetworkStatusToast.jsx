import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function NetworkStatusToast() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '8px 18px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
          backdropFilter: 'blur(10px)',
          background: isOnline 
            ? 'linear-gradient(135deg, rgba(46, 204, 113, 0.92) 0%, rgba(39, 174, 96, 0.92) 100%)'
            : 'linear-gradient(135deg, rgba(231, 76, 60, 0.92) 0%, rgba(192, 57, 43, 0.92) 100%)',
          color: '#ffffff',
          pointerEvents: 'none'
        }}
      >
        <span>{isOnline ? '⚡' : '🌐'}</span>
        <span>
          {isOnline 
            ? 'Ligação restabelecida!' 
            : 'Modo Offline — Sem ligação à internet'}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
