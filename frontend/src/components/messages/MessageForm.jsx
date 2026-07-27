import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';

export default function MessageForm({ onSubmit, t }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const coupleId = localStorage.getItem('coupleId') || '';
  const meuNome = localStorage.getItem('nome') || '';

  // Limpar timeout e notificar par ao desmontar
  const stopTyping = () => {
    if (socket && isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('stop-typing', { room: coupleId, user: meuNome });
    }
  };

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, []);

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (!socket) return;

    if (value.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit('typing', { room: coupleId, user: meuNome });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Parar após 1.5s sem novas teclas
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1500);
    } else {
      // Se apagou o texto todo, para imediatamente de notificar
      stopTyping();
    }
  };

  const handleBlur = () => {
    stopTyping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Parar indicador de escrita imediatamente
    stopTyping();

    try {
      setError('');
      await onSubmit(content.trim());
      setContent('');
    } catch {
      setError(t.messages_error_send || 'Erro ao enviar nota.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.messages_subtitle}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea
          className="input-control"
          placeholder={t.messages_placeholder}
          value={content}
          onChange={handleContentChange}
          onBlur={handleBlur}
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
      {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
}
