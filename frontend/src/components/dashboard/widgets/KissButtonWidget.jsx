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
  const [activeTab, setActiveTab] = useState('send'); // 'send' ou 'edit'
  
  // Lista de mensagens guardadas (persistidas em localStorage)
  const [savedMessages, setSavedMessages] = useState(() => {
    const saved = localStorage.getItem('custom_quick_carinhos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS;
  });

  // Texto da frase no widget do Dashboard
  const [widgetInputText, setWidgetInputText] = useState('');
  // Texto para adicionar nova frase na aba lateral
  const [newPhraseText, setNewPhraseText] = useState('');
  
  // Estado de edição de frases existentes
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [sending, setSending] = useState(false);
  const [lastSentText, setLastSentText] = useState('');
  
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  // Atualizar localStorage
  useEffect(() => {
    localStorage.setItem('custom_quick_carinhos', JSON.stringify(savedMessages));
  }, [savedMessages]);

  const handleSendCarinho = (text, type = 'quick-love') => {
    if (sending) return;

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

    setLastSentText(text);
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
      setLastSentText('');
    }, 3500);
  };

  const handleWidgetSubmit = (e) => {
    e.preventDefault();
    if (!widgetInputText.trim()) return;
    handleSendCarinho(widgetInputText.trim(), 'quick-love');
    setWidgetInputText('');
  };

  const handleAddPhrase = (e) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const item = {
      id: (new Date()).getTime().toString(),
      emoji: '💖',
      text: newPhraseText.trim(),
      type: 'quick-love'
    };

    setSavedMessages(prev => [...prev, item]);
    setNewPhraseText('');
    showToast(language === 'pt' ? 'Nova frase adicionada à tua coleção! ✨' : 'New message added! ✨', 'success');
  };

  const handleDeletePhrase = (id) => {
    setSavedMessages(prev => prev.filter(m => m.id !== id));
    showToast(language === 'pt' ? 'Frase removida.' : 'Message deleted.', 'info');
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    setSavedMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingText.trim() } : m));
    setEditingId(null);
    setEditingText('');
    showToast(language === 'pt' ? 'Frase atualizada!' : 'Message updated!', 'success');
  };

  const handleSelectPhraseForWidget = (msgText) => {
    setWidgetInputText(msgText);
    showToast(language === 'pt' ? 'Frase selecionada para o widget!' : 'Phrase selected for widget!', 'info');
  };

  // Renderização da Aba Lateral via Portal
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
            maxWidth: '380px',
            height: '100%',
            background: 'var(--bg-glass, rgba(255, 255, 255, 0.96))',
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
          {/* Header da Aba Lateral */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💖</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                {language === 'pt' ? 'Carinhos & Mensagens' : 'Love & Messages'}
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

          {/* Abas Superiores: Selecionar/Enviar vs Editar Frases */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('send')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'send' ? '#fff' : 'transparent',
                color: activeTab === 'send' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === 'send' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              💌 {language === 'pt' ? 'Enviar & Selecionar' : 'Send & Select'}
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'edit' ? '#fff' : 'transparent',
                color: activeTab === 'edit' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === 'edit' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              ✏️ {language === 'pt' ? 'Editar Frases' : 'Edit Phrases'}
            </button>
          </div>

          {/* VISTA 1: SELECIONAR E ENVIAR MENSAGENS */}
          {activeTab === 'send' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                {language === 'pt'
                  ? 'Toca numa frase para ENVIAR imediatamente ou carregar no Widget:'
                  : 'Tap a phrase to SEND immediately or set into Widget:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedMessages.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      background: 'rgba(255, 255, 255, 0.75)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                      <span>{item.emoji || '💖'}</span>
                      {item.text}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleSelectPhraseForWidget(item.text)}
                        title={language === 'pt' ? 'Usar no Widget' : 'Use in Widget'}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.1)',
                          background: 'rgba(255,255,255,0.9)',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        📌 {language === 'pt' ? 'No Widget' : 'In Widget'}
                      </button>
                      <button
                        onClick={() => {
                          handleSendCarinho(item.text, item.type);
                          setIsDrawerOpen(false);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--primary-color, #ff4d6d)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🚀 {language === 'pt' ? 'Enviar' : 'Send'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 2: SECÇÃO PARA EDITAR E GERIR FRASES */}
          {activeTab === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {/* Form de Adicionar Frase */}
              <form onSubmit={handleAddPhrase} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {language === 'pt' ? '➕ Criar Nova Frase' : '➕ Create New Phrase'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPhraseText}
                    onChange={(e) => setNewPhraseText(e.target.value)}
                    maxLength={50}
                    placeholder={language === 'pt' ? 'Ex: Estou com saudades tuas! ❤️' : 'Ex: Thinking of you! ❤️'}
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
                    disabled={!newPhraseText.trim()}
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

              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                {language === 'pt' ? '📋 As tuas Frases de Carinho' : '📋 Your Saved Phrases'}
              </label>

              {/* Lista para Editar e Eliminar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {savedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.85)',
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
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditingText(msg.text);
                            }}
                            title="Editar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePhrase(msg.id)}
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
      {/* Widget Fininho com Input de Texto e Botão de Envio Direto */}
      <div 
        className="glass-panel"
        style={{
          padding: '8px 12px',
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
          gap: '8px',
          minHeight: '46px'
        }}
      >
        {/* Botão Rápido de Beijinho */}
        <button
          onClick={() => handleSendCarinho('Beijinho 💋', 'kiss')}
          disabled={sending}
          title={language === 'pt' ? 'Mandar Beijinho Instantâneo' : 'Send Instant Kiss'}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '20px'
          }}
        >
          <span style={{ animation: sending ? 'pulse 0.4s infinite' : 'none' }}>
            💋
          </span>
        </button>

        {/* Input de Texto Direto no Widget + Form de Envio */}
        <form onSubmit={handleWidgetSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <input
            type="text"
            value={widgetInputText}
            onChange={(e) => setWidgetInputText(e.target.value)}
            maxLength={60}
            placeholder={
              lastSentText
                ? (language === 'pt' ? `Enviado! 💖` : `Sent! 💖`)
                : (language === 'pt' ? 'Escreve uma frase rápida...' : 'Type a quick message...')
            }
            style={{
              width: '100%',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.45)',
              fontSize: '13px',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!widgetInputText.trim() || sending}
            title={language === 'pt' ? 'Enviar Frase' : 'Send Message'}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: 'none',
              background: widgetInputText.trim() ? 'var(--primary-color, #ff4d6d)' : 'rgba(0,0,0,0.1)',
              color: widgetInputText.trim() ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              cursor: widgetInputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            💌
          </button>
        </form>

        {/* Botão para Abrir a Aba Lateral de Frases */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="btn btn-secondary"
          title={language === 'pt' ? 'Abrir Coleção de Frases' : 'Open Phrase Collection'}
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <span>✨</span> {language === 'pt' ? 'Frases' : 'Phrases'}
        </button>
      </div>

      {/* Aba Lateral Slide-Over via Portal */}
      {renderDrawer()}
    </>
  );
}
