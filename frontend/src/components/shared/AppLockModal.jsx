import { useState } from 'react';
import { useAppLock } from '../../context/AppLockContext';

export default function AppLockModal({ language = 'pt' }) {
  const { isLocked, unlockApp } = useAppLock();
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (num) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(newPin);
          if (!success) {
            setError(true);
            setInputPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="scratch-lightbox-overlay" style={{ zIndex: 99999, background: 'rgba(15, 10, 25, 0.96)', backdropFilter: 'blur(15px)' }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '340px', padding: '30px 20px', textAlign: 'center', borderRadius: '24px' }}>
        <div style={{ fontSize: '42px', marginBottom: '10px' }}>🔒</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-main)' }}>
          {language === 'pt' ? 'O Nosso Cantinho ❤️' : 'Our Corner ❤️'}
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {language === 'pt' ? 'Introduz o teu PIN de 4 dígitos' : 'Enter your 4-digit PIN'}
        </p>

        {/* PIN Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
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
