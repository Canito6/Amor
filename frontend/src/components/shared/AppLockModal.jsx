import { useState, useEffect } from 'react';
import { useAppLock } from '../../context/AppLockContext';
import { useHaptic } from '../../hooks/useHaptic';

export default function AppLockModal({ language = 'pt' }) {
  const { isLocked, unlockApp, unlockWithBiometrics, isBiometricsSupported, biometricsEnabled } = useAppLock();
  const { triggerLight, triggerSuccess, triggerWarning } = useHaptic();
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setInputPin('');
      setError(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = (num) => {
    triggerLight();
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(newPin);
          if (success) {
            triggerSuccess();
          } else {
            triggerWarning();
            setError(true);
            setInputPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    triggerLight();
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometrics = async () => {
    triggerLight();
    const success = await unlockWithBiometrics();
    if (success) {
      triggerSuccess();
    }
  };

  return (
    <div className="scratch-lightbox-overlay" style={{ zIndex: 99999, background: 'rgba(15, 10, 25, 0.96)', backdropFilter: 'blur(15px)' }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '340px', padding: '30px 20px', textAlign: 'center', borderRadius: '24px' }}>
        <div style={{ fontSize: '42px', marginBottom: '10px' }}>🔒</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-main)' }}>
          AMORI ❤️
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {language === 'pt' ? 'Introduz o teu PIN de 4 dígitos ou usa Biometria' : 'Enter your 4-digit PIN or use Biometrics'}
        </p>

        {/* PIN Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: i < inputPin.length ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)',
                border: error ? '2px solid #ff4d4d' : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '15px', fontWeight: 'bold' }}>
            {language === 'pt' ? 'PIN Incorreto! Tenta novamente.' : 'Incorrect PIN! Try again.'}
          </p>
        )}

        {/* Botão de Autenticação Biométrica (Face ID / Touch ID) */}
        {isBiometricsSupported && (
          <button
            onClick={handleBiometrics}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginBottom: '20px',
              padding: '10px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '700'
            }}
          >
            👆 {language === 'pt' ? 'Desbloquear com Face ID / Touch ID' : 'Unlock with Face ID / Touch ID'}
          </button>
        )}

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '240px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="btn btn-secondary"
              style={{
                height: '54px',
                borderRadius: '50%',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress(0)}
            className="btn btn-secondary"
            style={{
              height: '54px',
              borderRadius: '50%',
              fontSize: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-secondary"
            style={{
              height: '54px',
              borderRadius: '50%',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
