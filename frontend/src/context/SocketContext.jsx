import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);

  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setSessionKey(prev => prev + 1);
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const coupleId = localStorage.getItem('coupleId') || 'default_couple';
    const meuNome = localStorage.getItem('nome') || '';

    if (!token) {
      setSocket(null);
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' && window.location.port === '5173' ? 'http://localhost:5000' : '');
    
    // Conectar ao socket
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor Socket.io, sala:', coupleId);
      newSocket.emit('join-couple', coupleId);
    });

    newSocket.on('update', (data) => {
      // Ignorar eventos gerados por nós próprios
      if (data.user === meuNome) return;

      // Despachar evento global para que os componentes reajam em tempo real
      window.dispatchEvent(new CustomEvent('socket-update', { detail: data }));

      let message = '';
      if (data.type === 'mood') {
        message = `O teu amor atualizou o humor para ${data.value}!`;
      } else if (data.type === 'coupon-gifted') {
        message = `O teu amor ofereceu-te um novo vale: "${data.value}"! 🎟️`;
      } else if (data.type === 'coupon-redeemed') {
        message = `O teu amor resgatou o vale: "${data.value}"! 🎁`;
      } else if (data.type === 'bucket-created') {
        message = `O teu amor adicionou um novo desejo à lista: "${data.value}"! 📝`;
      } else if (data.type === 'bucket-completed') {
        message = `O teu amor concluiu o desejo: "${data.value}"! 🏆`;
      } else if (data.type === 'bucket-uncompleted') {
        message = `O teu amor desmarcou o desejo: "${data.value}" como pendente.`;
      }

      if (message) {
        setToast(message);
        // Tocar um som de notificação de sistema suave (Web Audio API)
        playNotificationSound();
        
        // Auto esconder após 5 segundos
        setTimeout(() => {
          setToast(prev => prev === message ? null : prev);
        }, 5000);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionKey]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tom 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      // Tom 2 (um acorde maior 0.08s depois)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 80);
    } catch (e) {
      // AudioContext bloqueado pelo browser
    }
  };

  return (
    <SocketContext.Provider value={socket}>
      {children}
      
      {/* Toast Alert Render em Linha */}
      {toast && (
        <div style={toastStyles.container} className="fade-in">
          <div style={toastStyles.icon}>💖</div>
          <div style={toastStyles.body}>{toast}</div>
          <button style={toastStyles.close} onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </SocketContext.Provider>
  );
}

const toastStyles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.9))',
    border: '1.5px solid var(--primary-color, #ff4d6d)',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: '0 10px 25px rgba(255, 77, 109, 0.25)',
    backdropFilter: 'blur(20px)',
    maxWidth: '350px',
    boxSizing: 'border-box',
    animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  icon: {
    fontSize: '22px',
    flexShrink: 0
  },
  body: {
    fontFamily: 'var(--font-title), sans-serif',
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-main, #2b2d42)',
    textAlign: 'left',
    lineHeight: '1.4'
  },
  close: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #8c8c8c)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
    flexShrink: 0,
    marginLeft: '5px',
    transition: 'color 0.2s ease'
  }
};
