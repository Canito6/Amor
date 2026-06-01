import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import './Mensagens.css';

const QUICK_EMOJIS = ['❤️', '😍', '😂', '😭', '🥺', '💕', '✨', '🔥'];

export default function Mensagens() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estado para edição inline de mensagens
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Estado para o painel de emoji aberto
  const [emojiPanelId, setEmojiPanelId] = useState(null);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  // Cores pastel para rodar nas notas
  const coresPostIt = [
    { bg: '#fff9db', border: '#ffe066' }, // Amarelo
    { bg: '#e3faf2', border: '#96f2d7' }, // Verde
    { bg: '#e8f0fe', border: '#adc6ff' }, // Azul
    { bg: '#fff0f6', border: '#ffdeeb' }, // Rosa
    { bg: '#f3f0ff', border: '#d0bfff' }  // Roxo
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarMensagens();
  }, [navigate]);

  // Fechar painel de emojis ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setEmojiPanelId(null);
    if (emojiPanelId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [emojiPanelId]);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      const dados = await apiFetch('/api/messages');
      setMessages(dados);
    } catch (err) {
      setErro(t.messages_error_load);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setErro('');
      const novaMsg = await apiFetch('/api/messages', {
        method: 'POST',
        body: { content }
      });
      setMessages([...messages, novaMsg]);
      setContent('');
    } catch (err) {
      setErro(t.messages_error_send);
    }
  };

  const iniciarEdicao = (msg) => {
    setEditingId(msg._id);
    setEditContent(msg.content);
    setEmojiPanelId(null);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setEditContent('');
  };

  const guardarEdicao = async (id) => {
    if (!editContent.trim()) return;
    try {
      setErro('');
      const atualizada = await apiFetch(`/api/messages/${id}`, {
        method: 'PUT',
        body: { content: editContent }
      });
      setMessages(messages.map(m => m._id === id ? atualizada : m));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      setErro(err.message || 'Erro ao editar mensagem.');
    }
  };

  const reagirMensagem = async (e, msgId, emoji) => {
    e.stopPropagation();
    try {
      const atualizada = await apiFetch(`/api/messages/${msgId}/react`, {
        method: 'PUT',
        body: { emoji }
      });
      setMessages(messages.map(m => m._id === msgId ? atualizada : m));
    } catch (err) {
      console.error('Erro ao reagir:', err);
    } finally {
      setEmojiPanelId(null);
    }
  };

  const apagarMensagem = async (id) => {
    if (!window.confirm(t.messages_delete_confirm)) return;

    try {
      setErro('');
      await apiFetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (err) {
      setErro(t.messages_error_delete);
    }
  };

  return (
    <div className="app-container fade-in">
      <div className="page-header">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.messages_title}</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.messages_subtitle}</h2>
        <form onSubmit={enviarMensagem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea
            className="input-control"
            placeholder={t.messages_placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            required
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              {t.messages_submit}
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.messages_loading}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{t.messages_empty}</p>
        </div>
      ) : (
        <div className="notes-grid">
          {messages.map((msg, index) => {
            const cores = coresPostIt[index % coresPostIt.length];
            const podeEditar = msg.sender === meuNome || minhaRole === 'admin';
            const podeApagar = msg.sender === meuNome || minhaRole === 'admin';
            const isEditing = editingId === msg._id;
            const minhaReacao = msg.reactions?.find(r => r.username === meuNome);
            
            return (
              <div 
                key={msg._id} 
                className="post-it"
                style={{ 
                  backgroundColor: cores.bg, 
                  borderColor: cores.border 
                }}
              >
                {/* Conteúdo ou Campo de Edição */}
                {isEditing ? (
                  <div className="post-it-edit-area">
                    <textarea
                      className="post-it-edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      autoFocus
                      style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderColor: cores.border }}
                    />
                    <div className="post-it-edit-actions">
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '13px' }} onClick={() => guardarEdicao(msg._id)}>
                        💾 {t.save}
                      </button>
                      <button className="btn btn-dark" style={{ padding: '4px 12px', fontSize: '13px' }} onClick={cancelarEdicao}>
                        ✕ {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="post-it-content">
                    {msg.content}
                    {msg.isEdited && (
                      <span className="post-it-edited">(editado)</span>
                    )}
                  </div>
                )}

                {/* Reações existentes */}
                {!isEditing && msg.reactions && msg.reactions.length > 0 && (
                  <div className="post-it-reactions">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="reaction-badge" title={r.username}>
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}

                <div className="post-it-footer">
                  <div>
                    {t.messages_by} <span className="post-it-author">{msg.sender}</span>
                    <br />
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>
                      {new Date(msg.createdAt).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {!isEditing && (
                    <div className="post-it-actions">
                      {/* Botão de reação */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className={`reaction-btn ${minhaReacao ? 'reacted' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmojiPanelId(emojiPanelId === msg._id ? null : msg._id);
                          }}
                          title="Reagir"
                        >
                          {minhaReacao ? minhaReacao.emoji : '😊'}
                        </button>
                        {emojiPanelId === msg._id && (
                          <div className="emoji-picker-panel" onClick={(e) => e.stopPropagation()}>
                            {QUICK_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                className="emoji-option"
                                onClick={(e) => reagirMensagem(e, msg._id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botão de editar */}
                      {podeEditar && (
                        <button 
                          onClick={() => iniciarEdicao(msg)}
                          className="post-it-action-btn"
                          title={t.edit}
                        >
                          ✏️
                        </button>
                      )}

                      {/* Botão de apagar */}
                      {podeApagar && (
                        <button 
                          onClick={() => apagarMensagem(msg._id)}
                          className="post-it-action-btn danger"
                          title={t.delete}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
