import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';

export default function MessageForm({ onSubmit, t }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const coupleId = localStorage.getItem('coupleId') || '';
  const meuNome = localStorage.getItem('nome') || '';

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (socket) {
      if (!isTypingRef.current && value.trim().length > 0) {
        isTypingRef.current = true;
        socket.emit('typing', { room: coupleId, user: meuNome });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.emit('stop-typing', { room: coupleId, user: meuNome });
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Parar indicador de escrita imediatamente
    if (socket && isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('stop-typing', { room: coupleId, user: meuNome });
    }

    try {
      setError('');
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
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
