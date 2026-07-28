import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../../services/chat/messageService';
import { usePreferences } from '../../context/PreferencesContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { translations } from '../../services/common/translations';
import { useSocket } from '../../context/SocketContext';
import MessageForm from '../../components/messages/MessageForm';
import TypingIndicator from '../../components/messages/TypingIndicator';
import MessageList from '../../components/messages/MessageList';
import useSocketUpdate from '../../hooks/shared/useSocketUpdate';
import { sounds } from '../../utils/ui/soundEffects';
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
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const t = translations[language];
  const socket = useSocket();

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await messageService.getMessages();
      setMessages(dados);
    } catch {
      setError(t.messages_error_load || 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const typingTimerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarMensagens();

    if (socket) {
      const handlePartnerTyping = (data) => {
        setPartnerTyping(true);
        setPartnerNameTyping(data.user || (language === 'pt' ? 'O teu par' : 'Your partner'));
        
        // Auto-limpeza de segurança após 3 segundos sem novas atualizações
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 3000);
      };

      const handlePartnerStopTyping = () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        setPartnerTyping(false);
      };

      socket.on('partner-typing', handlePartnerTyping);
      socket.on('partner-stop-typing', handlePartnerStopTyping);

      return () => {
        socket.off('partner-typing', handlePartnerTyping);
        socket.off('partner-stop-typing', handlePartnerStopTyping);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      };
    }
  }, [navigate, socket, language]);

  useSocketUpdate(() => {
    carregarMensagens();
  }, ['mensagem-']);

  const syncOfflineMessages = async () => {
    const queue = JSON.parse(localStorage.getItem('messages_offline_queue') || '[]');
    if (queue.length === 0) return;

    try {
      showToast(
        language === 'pt' ? 'A enviar notas guardadas localmente...' : 'Sending locally saved notes...',
        'info'
      );
      for (const item of queue) {
        await messageService.createMessage(item.content);
      }
      localStorage.removeItem('messages_offline_queue');
      carregarMensagens();
      showToast(
        language === 'pt' ? 'Notas offline enviadas com sucesso! 🎉' : 'Offline notes sent successfully! 🎉',
        'success'
      );
    } catch (e) {
      console.error('Erro ao sincronizar notas offline:', e);
    }
  };

  useEffect(() => {
    window.addEventListener('online', syncOfflineMessages);
    if (navigator.onLine) {
      syncOfflineMessages();
    }
    return () => window.removeEventListener('online', syncOfflineMessages);
  }, []);

  const handleCreateMessageSubmit = async (content) => {
    setError('');
    if (!navigator.onLine) {
      const tempMsg = {
        _id: `temp-${Date.now()}`,
        content,
        createdBy: meuNome || 'Amor',
        sender: meuNome || 'Amor',
        createdAt: new Date().toISOString(),
        reactions: [],
        isOffline: true
      };
      
      const queue = JSON.parse(localStorage.getItem('messages_offline_queue') || '[]');
      queue.push({ content });
      localStorage.setItem('messages_offline_queue', JSON.stringify(queue));
      
      setMessages([...messages, tempMsg]);
      sounds.playPop();
      showToast(
        language === 'pt'
          ? 'Sem ligação de rede! A nota foi guardada localmente e será enviada quando estiveres online. ⏳'
          : 'No connection! The note has been saved locally and will be sent when you are online. ⏳',
        'warning'
      );
      return;
    }

    try {
      const novaMsg = await messageService.createMessage(content);
      setMessages([...messages, novaMsg]);
      sounds.playPop();
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
    const _ok = await confirm({ title: t.messages_delete_confirm, message: t.messages_delete_confirm, confirmText: t.delete || 'Apagar', cancelText: t.cancel || 'Cancelar' }); if (!_ok) return;

    try {
      setError('');
      await messageService.deleteMessage(id);
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch {
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
        <TypingIndicator partnerNameTyping={partnerNameTyping} />
      )}

      {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>{error}</p>}

      <MessageList 
        loading={loading}
        messages={messages}
        meuNome={meuNome}
        minhaRole={minhaRole}
        language={language}
        t={t}
        handleUpdateMessage={handleUpdateMessage}
        handleDeleteMessage={handleDeleteMessage}
        handleReactToMessage={handleReactToMessage}
      />
    </div>
  );
}
