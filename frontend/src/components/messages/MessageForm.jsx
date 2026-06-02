import React, { useState } from 'react';

export default function MessageForm({ onSubmit, t }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
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
      {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
}
