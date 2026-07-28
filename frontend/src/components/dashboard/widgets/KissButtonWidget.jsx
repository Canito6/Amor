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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('select'); // 'select' ou 'edit'
  
  // Mensagens guardadas em localStorage
  const [savedMessages, setSavedMessages] = useState(() => {
    const saved = localStorage.getItem('custom_quick_carinhos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS;
  });

  // Frase selecionada para o widget do Dashboard
  const [selectedPhrase, setSelectedPhrase] = useState(() => {
    const saved = localStorage.getItem('selected_widget_carinho');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* erro silenciado */ }
    }
    return DEFAULT_PRESETS[0];
  });

  // Estados de criação e edição
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseEmoji, setNewPhraseEmoji] = useState('💖');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const [sending, setSending] = useState(false);
  const [lastSentText, setLastSentText] = useState('');
  
  const socket = useSocket();
  const { showToast } = useToast();
  const { triggerVibration } = useHaptic();

  // Escutar evento para abrir o modal via menu da Sidebar
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };
    window.addEventListener('openLovePhrasesDrawer', handleOpenModal);
    return () => window.removeEventListener('openLovePhrasesDrawer', handleOpenModal);
  }, []);

  // Persistir em localStorage
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
        ? `Frase "${msgItem.text}" definida no Widget! 📌`
        : `Phrase "${msgItem.text}" set on Widget! 📌`,
      'success'
    );
    setIsModalOpen(false);
  };

  const handleAddPhrase = (e) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const item = {
      id: (new Date()).getTime().toString(),
      emoji: newPhraseEmoji || '💖',
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

  // Renderização do Modal Centralizado com Tema Dark Romantic Glassmorphism
  const renderCentralModal = () => {
    if (!isModalOpen) return null;

    const modalContent = (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 5, 12, 0.75)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '460px',
            maxHeight: '85vh',
            background: 'linear-gradient(145deg, rgba(32, 14, 28, 0.95), rgba(18, 8, 16, 0.98))',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 77, 109, 0.35)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 77, 109, 0.2)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxSizing: 'border-box',
            color: '#fff',
            overflow: 'hidden'
          }}
        >
          {/* Header do Modal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, rgba(255,77,109,0.25), rgba(255,117,143,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                border: '1px solid rgba(255,77,109,0.3)'
              }}>
                💖
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' }}>
                  {language === 'pt' ? 'Frases de Carinho' : 'Love Phrases'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {language === 'pt' ? 'Personaliza e envia mimos em tempo real' : 'Personalize and send real-time love'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.15s ease'
              }}
            >
              ✕
            </button>
          </div>

          {/* Navegador de Separadores Interno */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '5px', 
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <button
              onClick={() => setActiveTab('select')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'select' ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' : 'transparent',
                color: activeTab === 'select' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                boxShadow: activeTab === 'select' ? '0 4px 14px rgba(255, 77, 109, 0.35)' : 'none'
              }}
            >
              📌 {language === 'pt' ? 'Ativar no Widget' : 'Widget Active'}
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'edit' ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' : 'transparent',
                color: activeTab === 'edit' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                boxShadow: activeTab === 'edit' ? '0 4px 14px rgba(255, 77, 109, 0.35)' : 'none'
              }}
            >
              ✏️ {language === 'pt' ? 'Gerir Coleção' : 'Manage List'}
            </button>
          </div>

          {/* VISTA 1: SELECIONAR FRASE ATIVA NO WIDGET */}
          {activeTab === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.4' }}>
                {language === 'pt'
                  ? 'Toca numa frase para a definir no teu Widget do Dashboard ou enviar já:'
                  : 'Tap a phrase to set it on your Dashboard Widget or send right now:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedMessages.map((item) => {
                  const isSelected = selectedPhrase?.id === item.id || selectedPhrase?.text === item.text;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPhraseForWidget(item)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '16px',
                        border: isSelected 
                          ? '1.5px solid #ff4d6d' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(255, 77, 109, 0.2), rgba(255, 117, 143, 0.08))' 
                          : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 16px rgba(255, 77, 109, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '22px' }}>{item.emoji || '💖'}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                          {item.text}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSelected ? (
                          <span style={{ 
                            fontSize: '11px', 
                            background: 'linear-gradient(135deg, #ff4d6d, #ff758f)', 
                            color: '#fff', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontWeight: '700',
                            boxShadow: '0 2px 8px rgba(255, 77, 109, 0.4)'
                          }}>
                            ✓ {language === 'pt' ? 'Ativa no Widget' : 'Active'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                            {language === 'pt' ? 'Usar' : 'Use'}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendCarinho(item);
                            setIsModalOpen(false);
                          }}
                          title={language === 'pt' ? 'Enviar Agora' : 'Send Now'}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
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

          {/* VISTA 2: GERIR E EDITAR FRASES */}
          {activeTab === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Formulário de Adição de Frase */}
              <form 
                onSubmit={handleAddPhrase} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  background: 'rgba(255, 255, 255, 0.04)', 
                  padding: '14px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 255, 255, 0.08)' 
                }}
              >
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
                  {language === 'pt' ? '➕ Criar Nova Frase' : '➕ Create New Phrase'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={newPhraseEmoji}
                    onChange={(e) => setNewPhraseEmoji(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(20, 10, 20, 0.8)',
                      color: '#fff',
                      fontSize: '16px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="💖">💖</option>
                    <option value="💋">💋</option>
                    <option value="❤️">❤️</option>
                    <option value="🫂">🫂</option>
                    <option value="☕">☕</option>
                    <option value="🥺">🥺</option>
                    <option value="🌹">🌹</option>
                    <option value="✨">✨</option>
                  </select>
                  <input
                    type="text"
                    value={newPhraseText}
                    onChange={(e) => setNewPhraseText(e.target.value)}
                    maxLength={50}
                    placeholder={language === 'pt' ? 'Ex: És o meu lugar seguro! ❤️' : 'Ex: You are my safe place! ❤️'}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newPhraseText.trim()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: newPhraseText.trim() ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' : 'rgba(255,255,255,0.1)',
                      color: newPhraseText.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: newPhraseText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {language === 'pt' ? 'Guardar' : 'Save'}
                  </button>
                </div>
              </form>

              <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
                {language === 'pt' ? '📋 Frases Existentes' : '📋 Existing Phrases'}
              </label>

              {/* Lista para Edição & Eliminação */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
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
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ff4d6d',
                            background: 'rgba(20, 10, 20, 0.9)',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
                          {msg.text}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditingText(msg.text);
                            }}
                            title="Editar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePhrase(msg.id)}
                            title="Eliminar"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px' }}
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

    return createPortal(modalContent, document.body);
  };

  return (
    <>
      {/* Widget Fininho no Dashboard (Botão Central Único com Frase Selecionada) */}
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

      {/* Modal Centralizado via Portal */}
      {renderCentralModal()}
    </>
  );
}
