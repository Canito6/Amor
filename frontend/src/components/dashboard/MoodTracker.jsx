import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import './MoodTracker.css';

const MOOD_EMOJIS = ['💖', '🥰', '😊', '🤪', '🥺', '😴', '😢', '🔥'];

export default function MoodTracker({ coupleInfo, loadCoupleInfo, t, language }) {
  const meuNome = localStorage.getItem('username') || localStorage.getItem('nome') || '';
  const [updating, setUpdating] = useState(false);

  // Encontrar utilizadores
  const meuRegisto = coupleInfo?.partners?.find(p => p.username === meuNome);
  const parceiroRegisto = coupleInfo?.partners?.find(p => p.username !== meuNome);

  const [meuMood, setMeuMood] = useState(meuRegisto?.moodEmoji || '');

  // Sincronizar estado local quando o coupleInfo é atualizado pelo pai
  useEffect(() => {
    if (meuRegisto) {
      setMeuMood(meuRegisto.moodEmoji || '');
    }
  }, [meuRegisto]);

  const handleSelectMood = async (emoji) => {
    if (updating) return;
    const novoMood = meuMood === emoji ? '' : emoji; // Clique duplo limpa
    try {
      setUpdating(true);
      setMeuMood(novoMood);
      await authService.updateMood(novoMood);
      if (loadCoupleInfo) {
        await loadCoupleInfo(); // recarregar informações para alinhar tudo
      }
    } catch (err) {
      console.error('Erro ao atualizar mood:', err);
      // Reverter em caso de erro
      setMeuMood(meuRegisto?.moodEmoji || '');
    } finally {
      setUpdating(false);
    }
  };

  // Helper para formatar o tempo relativo
  const formatarTempoRelativo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return t.mood_just_now || 'agora mesmo';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return t.mood_just_now || 'agora mesmo';
    if (diffMins < 60) return (t.mood_minutes_ago || '{count}m atrás').replace('{count}', diffMins);

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return (t.mood_hours_ago || '{count}h atrás').replace('{count}', diffHours);

    const diffDays = Math.floor(diffHours / 24);
    return (t.mood_days_ago || '{count}d atrás').replace('{count}', diffDays);
  };

  return (
    <div className="mood-tracker-widget glass-panel fade-in">
      <div className="mood-tracker-grid">
        
        {/* Painel do Utilizador */}
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

        {/* Painel do Parceiro */}
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
                  {t.mood_updated_at ? t.mood_updated_at.replace('{time}', formatarTempoRelativo(parceiroRegisto.moodUpdatedAt)) : `Atualizado há ${formatarTempoRelativo(parceiroRegisto.moodUpdatedAt)}`}
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

      </div>
    </div>
  );
}
