import { useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { useHaptic } from '../../../hooks/useHaptic';

export default function KissButtonWidget({ language, partnerName }) {
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  const handleSendKiss = () => {
    if (sending || justSent) return;

    // Vibração tátil de batimento cardíaco duplo
    triggerVibration([40, 60, 40, 80]);

    setSending(true);

    if (socket) {
      socket.emit('send-kiss', { timestamp: Date.now() });
    }

    setJustSent(true);
    showToast(
      language === 'pt' 
        ? `Beijinho enviado a ${partnerName || 'teu amor'}! 💋❤️` 
        : `Kiss sent to ${partnerName || 'your love'}! 💋❤️`,
      'success'
    );

    setTimeout(() => {
      setSending(false);
    }, 600);

    setTimeout(() => {
      setJustSent(false);
    }, 4000);
  };

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px 0 rgba(255, 77, 109, 0.12)',
        marginBottom: '20px',
        gap: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '28px', animation: sending ? 'pulse 0.4s infinite' : 'none' }}>
          💋
        </span>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
            {language === 'pt' ? 'Mandar um Beijinho' : 'Send a Kiss'}
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {justSent 
              ? (language === 'pt' ? 'Beijinho entregue! 💖' : 'Kiss delivered! 💖')
              : (language === 'pt' ? 'Envia uma vibração carinhosa em tempo real' : 'Send a real-time romantic vibration')}
          </p>
        </div>
      </div>

      <button
        onClick={handleSendKiss}
        disabled={sending || justSent}
        className="btn btn-primary"
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 15px rgba(255, 77, 109, 0.3)',
          opacity: justSent ? 0.75 : 1,
          transform: sending ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.15s ease, opacity 0.2s ease'
        }}
      >
        {justSent ? '💖' : '💋'} {language === 'pt' ? (justSent ? 'Enviado' : 'Enviar') : (justSent ? 'Sent' : 'Send')}
      </button>
    </div>
  );
}
