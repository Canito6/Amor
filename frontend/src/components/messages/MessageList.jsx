import React from 'react';
import PostItCard from './PostItCard';
import EmptyState from '../shared/EmptyState';

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
      <EmptyState
        icon="💬"
        title={t.messages_empty || "Sem notas ou mensagens"}
        description={language === 'pt' ? "Deixa um recado romântico ou piada fofa para o teu par no formulário acima!" : "Leave a romantic note or cute joke for your partner in the form above!"}
      />
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
