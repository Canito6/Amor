import React from 'react';

const MOOD_EMOJIS = ['💖', '🥰', '😊', '🤪', '🥺', '😴', '😢', '🔥'];

export default function MoodSelectionPanel({ meuMood, handleSelectMood, updating, t }) {
  return (
    <div className="mood-my-panel">
      <h4>{t.mood_tracker_title || 'Como te sentes hoje? 😊'}</h4>
      <p className="mood-instruction">{t.mood_select_instruction || 'Escolhe o teu humor:'}</p>
      <div className="mood-emojis-row">
        {MOOD_EMOJIS.map(emoji => {
          const isSelected = meuMood === emoji;
          return (
            <button
              key={emoji}
              className={`mood-emoji-btn ${isSelected ? 'active' : ''} ${updating ? 'disabled' : ''}`}
              onClick={() => handleSelectMood(emoji)}
              disabled={updating}
              title={isSelected ? 'Limpar humor' : `Selecionar ${emoji}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
