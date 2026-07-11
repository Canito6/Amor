import React from 'react';

export default function MoodPartnerPanel({ parceiroRegisto, formatarTempoRelativo, t }) {
  return (
    <div className="mood-partner-panel">
      <h4>{t.mood_partner_title || 'Humor do meu Amor'} 💑</h4>
      
      {parceiroRegisto && parceiroRegisto.moodEmoji ? (
        <div className="mood-partner-display">
          <span className="mood-partner-emoji-bubble bounce-animation">
            {parceiroRegisto.moodEmoji}
          </span>
          <div className="mood-partner-info">
            <span className="mood-partner-name">{parceiroRegisto.username}</span>
            <span className="mood-partner-time">
              {t.mood_updated_at 
                ? t.mood_updated_at.replace('{time}', formatarTempoRelativo(parceiroRegisto.moodUpdatedAt)) 
                : `Atualizado há ${formatarTempoRelativo(parceiroRegisto.moodUpdatedAt)}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="mood-partner-empty">
          <span className="mood-empty-icon">💭</span>
          <p>{t.mood_partner_empty || 'O teu amor ainda não registou o humor hoje.'}</p>
        </div>
      )}
    </div>
  );
}
