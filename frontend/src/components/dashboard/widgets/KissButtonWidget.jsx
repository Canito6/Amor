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
  const [activeDrawerTab, setActiveDrawerTab] = useState('select'); // 'select' ou 'edit'
  
  // Lista de mensagens salvas
  const [savedMessages, setSavedMessages] = useState(() => {
    const saved = localStorage.getItem('custom_quick_carinhos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS;
  });

  // Frase atualmente selecionada para o widget do Dashboard
  const [selectedPhrase, setSelectedPhrase] = useState(() => {
    const saved = localStorage.getItem('selected_widget_carinho');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS[0];
  });

  // Estados de edição de frases
  const [newPhraseText, setNewPhraseText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [sending, setSending] = useState(false);
  const [lastSentText, setLastSentText] = useState('');
  
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  // Escutar evento 'openLovePhrasesDrawer' disparado a partir da Sidebar principal
  useEffect(() => {
    const handleOpenDrawer = () => {
      setIsDrawerOpen(true);
    };
    window.addEventListener('openLovePhrasesDrawer', handleOpenDrawer);
    return () => window.removeEventListener('openLovePhrasesDrawer', handleOpenDrawer);
  }, []);

  // Guardar coleção e frase selecionada no localStorage
  useEffect(() => {
    localStorage.setItem('custom_quick_carinhos', JSON.stringify(savedMessages));
  }, [savedMessages]);

  useEffect(() => {
    localStorage.setItem('selected_widget_carinho', JSON.stringify(selectedPhrase));
  }, [selectedPhrase]);

  const handleSendCarinho = (phraseObj) => {
    if (sending) return;

    const textToSend = typeof phraseObj === 'string' ? phraseObj : phraseObj.text;
    const typeToSend = typeof phraseObj === 'object' && phraseObj.type ? phraseObj.type : 'quick-love';

    triggerVibration([40, 60, 40, 80]);
    setSending(true);

    const nowTimestamp = (new Date()).getTime();

    if (socket) {
      if (typeToSend === 'kiss' || textToSend.includes('Beijinho')) {
        socket.emit('send-kiss', { timestamp: nowTimestamp });
      } else {
        socket.emit('send-quick-love', { type: 'quick-love', value: textToSend, timestamp: nowTimestamp });
      }
    }

    setLastSentText(textToSend);
    showToast(
      language === 'pt'
        ? `Enviado a ${partnerName || 'teu amor'}: "${textToSend}" 💖`
        : `Sent to ${partnerName || 'your love'}: "${textToSend}" 💖`,
      'success'
    );

    setTimeout(() => {
      setSending(false);
    }, 600);

    setTimeout(() => {
      setLastSentText('');
    }, 3500);
  };

  const handleSelectPhraseForWidget = (msgItem) => {
    setSelectedPhrase(msgItem);
    showToast(
      language === 'pt'
        ? `Frase "${msgItem.text}" selecionada para o widget!`
        : `Phrase "${msgItem.text}" selected for widget!`,
      'success'
    );
    setIsDrawerOpen(false);
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
    showToast(language === 'pt' ? 'Nova frase criada com sucesso! ✨' : 'New phrase created! ✨', 'success');
  };

  const handleDeletePhrase = (id) => {
    setSavedMessages(prev => prev.filter(m => m.id !== id));
    if (selectedPhrase.id === id) {
      setSelectedPhrase(DEFAULT_PRESETS[0]);
    }
    showToast(language === 'pt' ? 'Frase removida.' : 'Phrase deleted.', 'info');
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    setSavedMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingText.trim() } : m));
    if (selectedPhrase.id === id) {
      setSelectedPhrase(prev => ({ ...prev, text: editingText.trim() }));
    }
    setEditingId(null);
    setEditingText('');
    showToast(language === 'pt' ? 'Frase atualizada!' : 'Phrase updated!', 'success');
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
                {language === 'pt' ? 'Frases de Carinho' : 'Love Phrases'}
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

          {/* Navegador Interno */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveDrawerTab('select')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeDrawerTab === 'select' ? '#fff' : 'transparent',
                color: activeDrawerTab === 'select' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeDrawerTab === 'select' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              📌 {language === 'pt' ? 'Selecionar Frase' : 'Select Phrase'}
            </button>
            <button
              onClick={() => setActiveDrawerTab('edit')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeDrawerTab === 'edit' ? '#fff' : 'transparent',
                color: activeDrawerTab === 'edit' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeDrawerTab === 'edit' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              ✏️ {language === 'pt' ? 'Editar Frases' : 'Edit Phrases'}
            </button>
          </div>

          {/* VISTA 1: SELEÇÃO DA FRASE ATIVA DO WIDGET */}
          {activeDrawerTab === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                {language === 'pt'
                  ? 'Escolhe a frase pronta que irá aparecer no teu Widget do Dashboard:'
                  : 'Choose the ready phrase that will appear on your Dashboard Widget:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedMessages.map((item) => {
                  const isSelected = selectedPhrase?.id === item.id || selectedPhrase?.text === item.text;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPhraseForWidget(item)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid var(--primary-color, #ff4d6d)' : '1px solid rgba(255, 255, 255, 0.4)',
                        background: isSelected ? 'rgba(255, 77, 109, 0.12)' : 'rgba(255, 255, 255, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                        <span style={{ fontSize: '18px' }}>{item.emoji || '💖'}</span>
                        {item.text}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSelected && (
                          <span style={{ fontSize: '11px', background: 'var(--primary-color, #ff4d6d)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontWeight: '700' }}>
                            ✓ {language === 'pt' ? 'Ativa no Widget' : 'Active'}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendCarinho(item);
                            setIsDrawerOpen(false);
                          }}
                          title={language === 'pt' ? 'Enviar Agora' : 'Send Now'}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(0,0,0,0.06)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🚀
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 2: EDITAR FRASES */}
          {activeDrawerTab === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {/* Form para Adicionar Nova Frase */}
              <form onSubmit={handleAddPhrase} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {language === 'pt' ? '➕ Criar Nova Frase Pronta' : '➕ Create New Ready Phrase'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPhraseText}
                    onChange={(e) => setNewPhraseText(e.target.value)}
                    maxLength={50}
                    placeholder={language === 'pt' ? 'Ex: És o meu mundo! ❤️' : 'Ex: You are my world! ❤️'}
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
                {language === 'pt' ? '📋 As tuas Frases de Carinho' : '📋 Saved Phrases'}
              </label>

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
      {/* Widget Fininho no Dashboard (Apenas 1 Botão Único para a Frase Selecionada) */}
      <div 
        className="glass-panel"
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 20px rgba(255, 77, 109, 0.1)',
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '44px'
        }}
      >
        <button
          onClick={() => handleSendCarinho(selectedPhrase)}
          disabled={sending}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            color: 'var(--text-main)',
            fontWeight: '600',
            fontSize: '13.5px',
            textAlign: 'center',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '18px', animation: sending ? 'pulse 0.4s infinite' : 'none' }}>
            {selectedPhrase.emoji || '💋'}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lastSentText 
              ? (language === 'pt' ? `Enviado a ${partnerName || 'teu amor'}! 💖` : `Sent to ${partnerName || 'your love'}! 💖`)
              : selectedPhrase.text}
          </span>
        </button>
      </div>

      {/* Aba Lateral Slide-Over via Portal */}
      {renderDrawer()}
    </>
  );
}
