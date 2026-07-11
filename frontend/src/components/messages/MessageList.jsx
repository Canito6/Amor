import React from 'react';
import PostItCard from './PostItCard';

export default function MessageList({
  loading,
  messages,
  meuNome,
  minhaRole,
  language,
  t,
  handleUpdateMessage,
  handleDeleteMessage,
  handleReactToMessage
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.messages_loading}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{t.messages_empty}</p>
      </div>
    );
  }

  return (
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
  );
}
