import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { showToast } = useToast();

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
    const coupleId = localStorage.getItem('coupleId') || '';
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
        showToast(message, 'info');
        // Tocar um som de notificação de sistema suave (Web Audio API)
        playNotificationSound();
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
      
    </SocketContext.Provider>
  );
}
