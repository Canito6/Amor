import { useState, useEffect } from 'react';
import { authService } from '../../../services/auth/authService';
import { useHaptic } from '../../../hooks/useHaptic';
import MoodHistoryPanel from './MoodHistoryPanel';
import { optimizeCloudinaryUrl } from '../../../utils/media/cloudinaryUrl';
import './MoodTracker.css';

const MOOD_EMOJIS = ['💖', '🥰', '😊', '🤪', '🥺', '😴', '😢', '🔥'];

export default function MoodTracker({ coupleInfo, loadCoupleInfo, t, language }) {
  const { triggerLight, triggerSuccess } = useHaptic();
  const meuNome = localStorage.getItem('username') || localStorage.getItem('nome') || '';
  const [updating, setUpdating] = useState(false);

  // Find users inside the couple
  const meuRegisto = coupleInfo?.partners?.find(p => p.username === meuNome);
  const parceiroRegisto = coupleInfo?.partners?.find(p => p.username !== meuNome);

  const [meuMood, setMeuMood] = useState(meuRegisto?.moodEmoji || '');
  const [showHistory, setShowHistory] = useState(false);

  // Sync local state when parent details load
  useEffect(() => {
    if (meuRegisto) {
      setMeuMood(meuRegisto.moodEmoji || '');
    }
  }, [meuRegisto]);

  const handleSelectMood = async (emoji) => {
    if (updating) return;
    triggerLight();
    const novoMood = meuMood === emoji ? '' : emoji; // Double click clears it
    try {
      setUpdating(true);
      setMeuMood(novoMood);
      await authService.updateMood(novoMood);
      triggerSuccess();
      if (loadCoupleInfo) {
        await loadCoupleInfo(); // reload parent stats
      }
    } catch (err) {
      console.error('Erro ao atualizar mood:', err);
      setMeuMood(meuRegisto?.moodEmoji || '');
    } finally {
      setUpdating(false);
    }
  };

  // Relative time helper
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

  // Helper to check if user has registered mood today
  const isMoodRegisteredToday = (registo) => {
    if (!registo || !registo.moodEmoji || !registo.moodUpdatedAt) return false;
    const updatedAt = new Date(registo.moodUpdatedAt);
    const today = new Date();
    return updatedAt.getDate() === today.getDate() &&
           updatedAt.getMonth() === today.getMonth() &&
           updatedAt.getFullYear() === today.getFullYear();
  };

  const meuHoje = isMoodRegisteredToday(meuRegisto);
  const parceiroHoje = isMoodRegisteredToday(parceiroRegisto);

  const calcularSintonia = () => {
    if (!meuHoje || !parceiroHoje) return 0;
    if (meuRegisto.moodEmoji === parceiroRegisto.moodEmoji) return 100;

    const meusEmojis = (meuRegisto.moodHistory || []).slice(-5).map(h => h.emoji).filter(Boolean);
    const parceiroEmojis = (parceiroRegisto.moodHistory || []).slice(-5).map(h => h.emoji).filter(Boolean);
    
    let matches = 0;
    meusEmojis.forEach(e => {
      if (parceiroEmojis.includes(e)) matches++;
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Side-by-side reciprocal mood display */}
          <div 
            className="mood-side-by-side" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'center', 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.3)', 
              borderRadius: '16px', 
              border: '1.5px solid rgba(255, 107, 157, 0.08)' 
            }}
          >
            {/* Current user card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={meuRegisto?.avatarUrl ? optimizeCloudinaryUrl(meuRegisto.avatarUrl, { width: 100 }) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${meuNome || 'me'}`} 
                  alt={meuNome} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary-color)', background: 'white' }} 
                />
                {meuHoje && meuRegisto?.moodEmoji && (
                  <span 
                    className="bounce-animation"
                    style={{ 
                      position: 'absolute', 
                      bottom: '-4px', 
                      right: '-4px', 
                      fontSize: '20px', 
                      background: 'white', 
                      borderRadius: '50%', 
                      padding: '2px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'block',
                      width: '24px',
                      height: '24px',
                      lineHeight: '24px',
                      textAlign: 'center'
                    }}
                  >
                    {meuRegisto.moodEmoji}
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-main)' }}>
                {language === 'pt' ? 'Eu' : 'Me'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {meuHoje ? (language === 'pt' ? 'Humor registado' : 'Mood logged') : (language === 'pt' ? 'Falta registar' : 'Not logged')}
              </span>
            </div>

            {/* Sintonia comparative badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 10px', minWidth: '90px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              {meuHoje && parceiroHoje ? (
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {sintonia}% Match
                </span>
              ) : (
                <span 
                  style={{ 
                    fontSize: '9.5px', 
                    color: 'var(--text-muted)', 
                    textAlign: 'center', 
                    lineHeight: '1.2', 
                    maxWidth: '120px',
                    fontWeight: '500'
                  }}
                >
                  {language === 'pt' ? 'Falta o registo de hoje' : 'Needs today\'s log'}
                </span>
              )}
            </div>

            {/* Partner card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={parceiroRegisto?.avatarUrl ? optimizeCloudinaryUrl(parceiroRegisto.avatarUrl, { width: 100 }) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${parceiroRegisto?.username || 'partner'}`} 
                  alt={parceiroRegisto?.username || 'Partner'} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--secondary-color)', background: 'white' }} 
                />
                {parceiroHoje && parceiroRegisto?.moodEmoji && (
                  <span 
                    className="bounce-animation"
                    style={{ 
                      position: 'absolute', 
                      bottom: '-4px', 
                      right: '-4px', 
                      fontSize: '20px', 
                      background: 'white', 
                      borderRadius: '50%', 
                      padding: '2px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'block',
                      width: '24px',
                      height: '24px',
                      lineHeight: '24px',
                      textAlign: 'center'
                    }}
                  >
                    {parceiroRegisto.moodEmoji}
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-main)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {parceiroRegisto?.username || (language === 'pt' ? 'Parceiro' : 'Partner')}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {parceiroHoje 
                  ? `${language === 'pt' ? 'Ativo' : 'Active'} ${formatarTempoRelativo(parceiroRegisto.moodUpdatedAt)}`
                  : (language === 'pt' ? 'Falta registar' : 'Not logged')}
              </span>
            </div>
          </div>

          {/* Prompt message when either hasn't logged mood today */}
          {(!meuHoje || !parceiroHoje) && (
            <div 
              style={{ 
                fontSize: '12px', 
                color: 'var(--primary-color)', 
                background: 'rgba(255, 107, 157, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: '500',
                border: '1px dashed rgba(255, 107, 157, 0.15)'
              }}
            >
              {language === 'pt' 
                ? 'Registem o vosso humor de hoje para ver a vossa sintonia! ⚡' 
                : 'Register your mood today to see your compatibility! ⚡'}
            </div>
          )}

          {/* Mood Selection Controls */}
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--text-main)' }}>
              {t.mood_tracker_title || 'Como te sentes hoje? 😊'}
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              {t.mood_select_instruction || 'Escolhe o teu humor:'}
            </p>
            <div className="mood-emojis-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {MOOD_EMOJIS.map(emoji => {
                const isSelected = meuMood === emoji;
                return (
                  <button
                    key={emoji}
                    className={`mood-emoji-btn ${isSelected ? 'active' : ''} ${updating ? 'disabled' : ''}`}
                    onClick={() => handleSelectMood(emoji)}
                    disabled={updating}
                    style={{
                      fontSize: '22px',
                      padding: '6px',
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(0,0,0,0.06)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(197,137,232,0.15))' : 'rgba(255,255,255,0.6)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      width: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifycontent: 'center',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    title={isSelected ? 'Limpar humor' : `Selecionar ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
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
