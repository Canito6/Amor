import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { useHaptic } from '../../../hooks/useHaptic';

const DEFAULT_PRESETS = [
  { id: '1', emoji: '💋', text: 'Beijinho 💋', type: 'kiss' },
  { id: '2', emoji: '❤️', text: 'Amo-te muito! ❤️', type: 'quick-love' },
  { id: '3', emoji: '🫂', text: 'Abraço quentinho! 🫂', type: 'quick-love' },
  { id: '4', emoji: '☕', text: 'A pensar em ti! ☕', type: 'quick-love' },
  { id: '5', emoji: '🥺', text: 'Saudades tuas! 🥺', type: 'quick-love' },
];

export default function KissButtonWidget({ language, partnerName }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('send'); // 'send' ou 'manage'
  const [customMessages, setCustomMessages] = useState(() => {
    const saved = localStorage.getItem('custom_quick_carinhos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS;
  });

  const [newMessageText, setNewMessageText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [customInputText, setCustomInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState('');
  
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  // Guardar mensagens no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('custom_quick_carinhos', JSON.stringify(customMessages));
  }, [customMessages]);

  const handleSendCarinho = (text, type = 'quick-love') => {
    if (sending) return;

    // Vibração tátil de batimento cardíaco duplo
    triggerVibration([40, 60, 40, 80]);
    setSending(true);

    const nowTimestamp = (new Date()).getTime();

    if (socket) {
      if (type === 'kiss' || text.includes('Beijinho')) {
        socket.emit('send-kiss', { timestamp: nowTimestamp });
      } else {
        socket.emit('send-quick-love', { type: 'quick-love', value: text, timestamp: nowTimestamp });
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

  const handleAddMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const item = {
      id: (new Date()).getTime().toString(),
      emoji: '💖',
      text: newMessageText.trim(),
      type: 'quick-love'
    };

    setCustomMessages(prev => [...prev, item]);
    setNewMessageText('');
    showToast(language === 'pt' ? 'Nova frase guardada com sucesso! ✨' : 'New message saved! ✨', 'success');
  };

  const handleDeleteMessage = (id) => {
    setCustomMessages(prev => prev.filter(m => m.id !== id));
    showToast(language === 'pt' ? 'Frase removida.' : 'Message removed.', 'info');
  };

  const handleStartEdit = (msg) => {
    setEditingId(msg.id);
    setEditingText(msg.text);
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    setCustomMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingText.trim() } : m));
    setEditingId(null);
    setEditingText('');
    showToast(language === 'pt' ? 'Frase atualizada! ✏️' : 'Message updated! ✏️', 'success');
  };

  const handleQuickInputSubmit = (e) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    handleSendCarinho(customInputText.trim(), 'quick-love');
    setCustomInputText('');
    setIsDrawerOpen(false);
  };

  // Renderização da Aba Lateral via Portal para cobrir 100% da janela
  const renderDrawer = () => {
    if (!isDrawerOpen) return null;

    const drawerContent = (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '360px',
            height: '100%',
            background: 'var(--bg-glass, rgba(255, 255, 255, 0.95))',
            backdropFilter: 'blur(20px)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            boxSizing: 'border-box',
            borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💖</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                {activeView === 'send' 
                  ? (language === 'pt' ? 'Mandar Carinho' : 'Send Love') 
                  : (language === 'pt' ? 'Editar Mensagens' : 'Edit Messages')}
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

          {/* Navegador de Abas Interno */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveView('send')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeView === 'send' ? '#fff' : 'transparent',
                color: activeView === 'send' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeView === 'send' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              🚀 {language === 'pt' ? 'Enviar' : 'Send'}
            </button>
            <button
              onClick={() => setActiveView('manage')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeView === 'manage' ? '#fff' : 'transparent',
                color: activeView === 'manage' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeView === 'manage' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              ✏️ {language === 'pt' ? 'Editar Lista' : 'Edit List'}
            </button>
          </div>

          {/* VISTA 1: ENVIAR CARINHO */}
          {activeView === 'send' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                {language === 'pt' 
                  ? 'Toca em qualquer mensagem para enviar instantaneamente com vibração tátil:' 
                  : 'Tap any message to send instantly with haptic feedback:'}
              </p>

              {/* Lista de Frases Guardadas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customMessages.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSendCarinho(item.text, item.type);
                      setIsDrawerOpen(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text-main)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{item.emoji || '💖'}</span>
                      {item.text}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>➔</span>
                  </button>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '4px 0' }} />

              {/* Campo Livre de Frase Rápida */}
              <form onSubmit={handleQuickInputSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {language === 'pt' ? '✍️ Enviar Frase Curta no Momento' : '✍️ Quick Custom Note'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    maxLength={60}
                    placeholder={language === 'pt' ? 'Ex: Saudades tuas! ❤️' : 'Ex: Miss you! ❤️'}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      background: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!customInputText.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      opacity: !customInputText.trim() ? 0.6 : 1
                    }}
                  >
                    💌
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VISTA 2: EDITAR / GERIR MENSAGENS GUARDADAS */}
          {activeView === 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {/* Formulário para Adicionar Nova Frase */}
              <form onSubmit={handleAddMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {language === 'pt' ? '➕ Adicionar Nova Mensagem' : '➕ Add New Message'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    maxLength={50}
                    placeholder={language === 'pt' ? 'Ex: Um abraço bem forte! 🫂' : 'Ex: Big hug! 🫂'}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      background: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {language === 'pt' ? 'Guardar' : 'Save'}
                  </button>
                </div>
              </form>

              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>
                {language === 'pt' ? '📋 As tuas Frases Guardadas' : '📋 Saved Messages'}
              </label>

              {/* Lista para Editar e Eliminar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {customMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    {editingId === msg.id ? (
                      <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={50}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--primary-color)',
                            fontSize: '13px'
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: '#9e9e9e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                          {msg.text}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleStartEdit(msg)}
                            title="Editar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Eliminar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(drawerContent, document.body);
  };

  return (
    <>
      {/* Widget Fininho no Dashboard */}
      <div 
        className="glass-panel"
        style={{
          padding: '8px 14px',
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
          gap: '10px',
          minHeight: '44px'
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
            fontSize: '13px',
            textAlign: 'left'
          }}
        >
          <span style={{ fontSize: '18px', animation: sending ? 'pulse 0.4s infinite' : 'none' }}>
            💋
          </span>
          <span>
            {lastSent 
              ? (language === 'pt' ? `Enviado! 💖` : `Sent! 💖`)
              : (language === 'pt' ? 'Mandar Beijinho' : 'Send Kiss')}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveView('send');
            setIsDrawerOpen(true);
          }}
          className="btn btn-secondary"
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer'
          }}
        >
          <span>✨</span> {language === 'pt' ? 'Aba Lateral' : 'Drawer'}
        </button>
      </div>

      {/* Portal para a Aba Lateral */}
      {renderDrawer()}
    </>
  );
}
