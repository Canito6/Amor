import { useState } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { useHaptic } from '../../../hooks/useHaptic';

export default function KissButtonWidget({ language, partnerName }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState('');
  
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  const handleSendCarinho = (text, type = 'kiss') => {
    if (sending) return;

    // Vibração tátil de batimento cardíaco duplo
    triggerVibration([40, 60, 40, 80]);

    setSending(true);

    if (socket) {
      if (type === 'kiss') {
        socket.emit('send-kiss', { timestamp: Date.now() });
      } else {
        socket.emit('send-quick-love', { type: 'quick-love', value: text, timestamp: Date.now() });
      }
    }

    setLastSent(text);
    showToast(
      language === 'pt'
        ? `Enviado a ${partnerName || 'teu amor'}: "${text}" 💖`
        : `Sent to ${partnerName || 'your love'}: "${text}" 💖`,
      'success'
    );

    setTimeout(() => {
      setSending(false);
    }, 600);

    setTimeout(() => {
      setLastSent('');
    }, 3500);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    handleSendCarinho(customText.trim(), 'quick-love');
    setCustomText('');
    setIsDrawerOpen(false);
  };

  const presetCarinhos = [
    { emoji: '💋', label: language === 'pt' ? 'Beijinho' : 'Kiss', text: language === 'pt' ? 'Beijinho 💋' : 'Kiss 💋', type: 'kiss' },
    { emoji: '❤️', label: language === 'pt' ? 'Amo-te!' : 'Love you!', text: language === 'pt' ? 'Amo-te muito! ❤️' : 'Love you so much! ❤️', type: 'quick-love' },
    { emoji: '🫂', label: language === 'pt' ? 'Abraço' : 'Hug', text: language === 'pt' ? 'Abraço quentinho! 🫂' : 'Warm hug! 🫂', type: 'quick-love' },
    { emoji: '☕', label: language === 'pt' ? 'Pensar em Ti' : 'Thinking of you', text: language === 'pt' ? 'A pensar em ti! ☕' : 'Thinking of you! ☕', type: 'quick-love' },
    { emoji: '🥺', label: language === 'pt' ? 'Saudades' : 'Miss you', text: language === 'pt' ? 'Saudades tuas! 🥺' : 'Miss you so much! 🥺', type: 'quick-love' },
  ];

  return (
    <>
      {/* Widget Fininho no Dashboard */}
      <div 
        className="glass-panel"
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 20px rgba(255, 77, 109, 0.1)',
          width: '100%',
          boxSizing: 'border-box',
          gap: '12px',
          minHeight: '48px'
        }}
      >
        <button
          onClick={() => handleSendCarinho('Beijinho 💋', 'kiss')}
          disabled={sending}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-main)',
            fontWeight: '600',
            fontSize: '13.5px',
            textAlign: 'left'
          }}
        >
          <span style={{ fontSize: '20px', animation: sending ? 'pulse 0.4s infinite' : 'none' }}>
            💋
          </span>
          <span>
            {lastSent 
              ? (language === 'pt' ? `Enviado! 💖` : `Sent! 💖`)
              : (language === 'pt' ? 'Mandar Beijinho' : 'Send Kiss')}
          </span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '12.5px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer'
          }}
        >
          <span>✨</span> {language === 'pt' ? 'Mais Carinhos' : 'More Love'}
        </button>
      </div>

      {/* Aba Lateral (Drawer Slide-Over) */}
      {isDrawerOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '340px',
              height: '100%',
              background: 'var(--bg-glass, rgba(255, 255, 255, 0.95))',
              backdropFilter: 'blur(20px)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowY: 'auto',
              boxSizing: 'border-box',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Header da Aba */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>💖</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {language === 'pt' ? 'Mandar Carinho' : 'Send Love'}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {language === 'pt' 
                ? 'Escolhe um gesto rápido ou escreve uma mensagem curta em tempo real:' 
                : 'Choose a quick gesture or write a short real-time message:'}
            </p>

            {/* Lista de Gestos Rápidos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {presetCarinhos.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSendCarinho(item.text, item.type);
                    setIsDrawerOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.emoji}</span>
                    {item.text}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>➔</span>
                </button>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '8px 0' }} />

            {/* Mensagem Curta Personalizada / Editável */}
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                {language === 'pt' ? '✍️ Frase Curta Personalizada' : '✍️ Custom Short Message'}
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={60}
                placeholder={language === 'pt' ? 'Ex: Estou a pensar em ti! ❤️' : 'Ex: Thinking of you! ❤️'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!customText.trim()}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: !customText.trim() ? 0.6 : 1,
                  cursor: !customText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                💌 {language === 'pt' ? 'Enviar Mensagem' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
