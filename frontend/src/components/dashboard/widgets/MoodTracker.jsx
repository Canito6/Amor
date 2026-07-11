import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/auth/authService';
import MoodSelectionPanel from './MoodSelectionPanel';
import MoodPartnerPanel from './MoodPartnerPanel';
import MoodHistoryPanel from './MoodHistoryPanel';
import './MoodTracker.css';

export default function MoodTracker({ coupleInfo, loadCoupleInfo, t, language }) {
  const meuNome = localStorage.getItem('username') || localStorage.getItem('nome') || '';
  const [updating, setUpdating] = useState(false);

  // Encontrar utilizadores
  const meuRegisto = coupleInfo?.partners?.find(p => p.username === meuNome);
  const parceiroRegisto = coupleInfo?.partners?.find(p => p.username !== meuNome);

  const [meuMood, setMeuMood] = useState(meuRegisto?.moodEmoji || '');
  const [showHistory, setShowHistory] = useState(false);

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

  const formatarDataHistorial = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularSintonia = () => {
    if (!meuRegisto?.moodEmoji || !parceiroRegisto?.moodEmoji) return 0;
    if (meuRegisto.moodEmoji === parceiroRegisto.moodEmoji) return 100;
    const meusEmojis = (meuRegisto.moodHistory || []).slice(-5).map(h => h.emoji);
    const parceiroEmojis = (parceiroRegisto.moodHistory || []).slice(-5).map(h => h.emoji);
    let matches = 0;
    meusEmojis.forEach(e => {
      if (e && parceiroEmojis.includes(e)) matches++;
    });
    return Math.min(Math.round((matches / Math.max(meusEmojis.length, 1)) * 100), 95);
  };

  const sintonia = calcularSintonia();

  return (
    <div className="mood-tracker-widget glass-panel fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
          💭 {language === 'pt' ? 'Rastreador de Humor' : 'Mood Tracker'}
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '2px 8px',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(255, 77, 109, 0.05)'
          }}
        >
          {showHistory ? '✕' : '📊 Historial'}
        </button>
      </div>

      {!showHistory ? (
        <div className="mood-tracker-grid">
          <MoodSelectionPanel 
            meuMood={meuMood}
            handleSelectMood={handleSelectMood}
            updating={updating}
            t={t}
          />
          <MoodPartnerPanel 
            parceiroRegisto={parceiroRegisto}
            formatarTempoRelativo={formatarTempoRelativo}
            t={t}
          />
        </div>
      ) : (
        <MoodHistoryPanel 
          sintonia={sintonia}
          meuRegisto={meuRegisto}
          parceiroRegisto={parceiroRegisto}
          formatarDataHistorial={formatarDataHistorial}
        />
      )}
    </div>
  );
}
