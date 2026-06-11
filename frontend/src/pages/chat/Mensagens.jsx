import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../../services/chat/messageService';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import { useSocket } from '../../context/SocketContext';
import MessageForm from '../../components/messages/MessageForm';
import PostItCard from '../../components/messages/PostItCard';
import useSocketUpdate from '../../hooks/useSocketUpdate';
import './Mensagens.css';

export default function Mensagens() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerNameTyping, setPartnerNameTyping] = useState('');

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarMensagens();

    if (socket) {
      socket.on('partner-typing', (data) => {
        setPartnerTyping(true);
        setPartnerNameTyping(data.user);
      });
      socket.on('partner-stop-typing', () => {
        setPartnerTyping(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('partner-typing');
        socket.off('partner-stop-typing');
      }
    };
  }, [navigate, socket]);

  useSocketUpdate(() => {
    carregarMensagens();
  }, ['mensagem-']);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await messageService.getMessages();
      setMessages(dados);
    } catch (err) {
      setError(t.messages_error_load || 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessageSubmit = async (content) => {
    try {
      setError('');
      const novaMsg = await messageService.createMessage(content);
      setMessages([...messages, novaMsg]);
    } catch (err) {
      setError(t.messages_error_send || 'Erro ao enviar nota.');
      throw err;
    }
  };

  const handleUpdateMessage = async (id, content) => {
    try {
      setError('');
      const atualizada = await messageService.updateMessage(id, content);
      setMessages(messages.map(m => m._id === id ? atualizada : m));
    } catch (err) {
      setError(err.message || 'Erro ao editar mensagem.');
      throw err;
    }
  };

  const handleReactToMessage = async (msgId, emoji) => {
    try {
      const atualizada = await messageService.reactToMessage(msgId, emoji);
      setMessages(messages.map(m => m._id === msgId ? atualizada : m));
    } catch (err) {
      console.error('Erro ao reagir:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm(t.messages_delete_confirm)) return;

    try {
      setError('');
      await messageService.deleteMessage(id);
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (err) {
      setError(t.messages_error_delete || 'Erro ao apagar nota.');
    }
  };

  return (
    <div className="app-container fade-in">
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.messages_title}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <MessageForm onSubmit={handleCreateMessageSubmit} t={t} />

      {partnerTyping && (
        <div className="typing-container">
          <span>💬 {partnerNameTyping} está a escrever</span>
          <span className="dot-animation">.</span>
          <span className="dot-animation" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="dot-animation" style={{ animationDelay: '0.4s' }}>.</span>
        </div>
      )}

      {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>{error}</p>}

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
          {messages.map((msg, index) => (
            <PostItCard
              key={msg._id}
              msg={msg}
              index={index}
              meuNome={meuNome}
              minhaRole={minhaRole}
              language={language}
              t={t}
              onUpdate={handleUpdateMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReactToMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
