import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/formatting/dateFormatter';

const QUICK_EMOJIS = ['❤️', '😍', '😂', '😭', '🥺', '💕', '✨', '🔥'];

const CORES_POST_IT = [
  { bg: 'linear-gradient(135deg, #fffcf0 0%, #fff9db 100%)', border: '#ffe066' }, // Amarelo Pastel
  { bg: 'linear-gradient(135deg, #f4fcf9 0%, #e3faf2 100%)', border: '#96f2d7' }, // Menta Suave
  { bg: 'linear-gradient(135deg, #f1f6fe 0%, #e8f0fe 100%)', border: '#adc6ff' }, // Céu Translúcido
  { bg: 'linear-gradient(135deg, #fff5f8 0%, #fff0f6 100%)', border: '#ffdeeb' }, // Rosa Romântico
  { bg: 'linear-gradient(135deg, #f8f6ff 0%, #f3f0ff 100%)', border: '#d0bfff' }  // Roxo Alfazema
];

export default function PostItCard({ msg, index, meuNome, minhaRole, language, t, onUpdate, onDelete, onReact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);
  const [isEmojiPanelOpen, setIsEmojiPanelOpen] = useState(false);

  const cores = CORES_POST_IT[index % CORES_POST_IT.length];
  const podeEditar = msg.sender === meuNome || minhaRole === 'admin';
  const podeApagar = msg.sender === meuNome || minhaRole === 'admin';
  const minhaReacao = msg.reactions?.find(r => r.username === meuNome);

  useEffect(() => {
    const handleClickOutside = () => setIsEmojiPanelOpen(false);
    if (isEmojiPanelOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isEmojiPanelOpen]);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    try {
      await onUpdate(msg._id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditContent(msg.content);
    setIsEditing(false);
  };

  const handleReact = (e, emoji) => {
    e.stopPropagation();
    onReact(msg._id, emoji);
    setIsEmojiPanelOpen(false);
  };

  return (
    <div 
      className="post-it"
      style={{ 
        background: cores.bg, 
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
            <button className="btn btn-primary post-it-edit-btn" onClick={handleSave}>
              💾 {t.save}
            </button>
            <button className="btn btn-dark post-it-edit-btn" onClick={handleCancel}>
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
            {formatDateTime(msg.createdAt, language === 'pt' ? 'pt' : 'en')}
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
                  setIsEmojiPanelOpen(!isEmojiPanelOpen);
                }}
                title="Reagir"
              >
                {minhaReacao ? minhaReacao.emoji : '😊'}
              </button>
              {isEmojiPanelOpen && (
                <div className="emoji-picker-panel" onClick={(e) => e.stopPropagation()}>
                  {QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      className="emoji-option"
                      onClick={(e) => handleReact(e, emoji)}
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
                onClick={() => setIsEditing(true)}
                className="post-it-action-btn"
                title={t.edit}
              >
                ✏️
              </button>
            )}

            {/* Botão de apagar */}
            {podeApagar && (
              <button 
                onClick={() => onDelete(msg._id)}
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
}
