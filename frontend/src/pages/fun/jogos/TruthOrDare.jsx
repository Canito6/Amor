import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { truthOrDareService } from '../../../services/fun/truthOrDareService';
import { triggerVictoryConfetti } from '../../../utils/confettiUtils';
import styles from './TruthOrDare.module.css';

export default function TruthOrDare() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customText, setCustomText] = useState('');

  const meuNome = localStorage.getItem('nome') || '';

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await truthOrDareService.joinSession();
      setSession(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Erro ao carregar o jogo', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Escutar atualizações via WebSockets em tempo real
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updatedSession) => {
      if (updatedSession && updatedSession.gameType === 'truth-or-dare') {
        setSession(updatedSession);
        if (updatedSession.state?.activeCard?.status === 'completed') {
          triggerVictoryConfetti();
        }
      }
    };

    socket.on('truth-or-dare-update', handleUpdate);

    return () => {
      socket.off('truth-or-dare-update', handleUpdate);
    };
  }, [socket]);

  const handleDraw = async (type) => {
    if (submitting) return;

    const truthsCount = session?.state?.truthsCount || {};
    const myTruthsUsed = truthsCount[meuNome] || 0;

    // Regra das 3 Verdades no frontend
    if (type === 'truth' && myTruthsUsed >= 3) {
      showToast(
        language === 'pt'
          ? 'Esgotaste as tuas 3 Verdades! És obrigado(a) a escolher Consequência 🔥'
          : 'You used all 3 Truths! You must choose Dare.',
        'warning'
      );
      return;
    }

    try {
      setSubmitting(true);
      const updated = await truthOrDareService.drawCard(type, customText);
      setSession(updated);
      setCustomText('');
    } catch (err) {
      showToast(err.message || 'Erro ao tirar carta', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const updated = await truthOrDareService.completeCard();
      setSession(updated);
      showToast(language === 'pt' ? 'Desafio concluído! +10 pontos! 🎉' : 'Challenge completed! +10 pts!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao concluir carta', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const updated = await truthOrDareService.refuseCard();
      setSession(updated);
      showToast(language === 'pt' ? 'Recusaste o desafio! Penalização obrigatória ativada! 🔥' : 'Challenge refused! Mandatory penalty active!', 'warning');
    } catch (err) {
      showToast(err.message || 'Erro ao recusar carta', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletePenalty = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const updated = await truthOrDareService.completePenalty();
      setSession(updated);
      showToast(language === 'pt' ? 'Penalização cumprida! Bravo! 👏' : 'Penalty completed! Well done!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao concluir penalização', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettingsChange = async (newLevel, newMode) => {
    try {
      const updated = await truthOrDareService.updateSettings(newLevel, newMode);
      setSession(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={`app-container fade-in ${styles.todContainer}`}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>🔥🔞</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A carregar o Verdade ou Consequência...' : 'Loading Truth or Dare...'}
          </p>
        </div>
      </div>
    );
  }

  const players = session?.players || [];
  const playerX = players[0];
  const playerO = players[1];

  const state = session?.state || {};
  const currentLevel = state.level || 'medium';
  const currentMode = state.mode || 'ai';
  const truthsCount = state.truthsCount || {};
  const activeCard = state.activeCard;
  const history = state.history || [];
  const scores = state.scores || {};

  const myTruthsUsed = truthsCount[meuNome] || 0;
  const myTruthsRemaining = Math.max(0, 3 - myTruthsUsed);
  const isTruthBlocked = myTruthsRemaining === 0;

  return (
    <div className={`app-container fade-in ${styles.todContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>🔥</span> {language === 'pt' ? 'Verdade ou Consequência' : 'Truth or Dare'}
        </h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Placares e Fichas de Verdades */}
      <div className={styles.scoreBanner}>
        <div className={styles.scoreBox}>
          <span className={styles.scorePlayerName}>{playerX ? playerX.username : 'Parceiro 1'}</span>
          <div className={`${styles.truthBadgeContainer} ${truthsCount[playerX?.username] >= 3 ? styles.truthBadgeBlocked : ''}`}>
            <span>😇 Verdades:</span>
            <span>{Math.max(0, 3 - (truthsCount[playerX?.username] || 0))}/3</span>
          </div>
          <span className={styles.scoreValue}>+{scores[playerX?.username] || 0} pts</span>
        </div>

        <div className={styles.scoreDivider}></div>

        <div className={styles.scoreBox}>
          <span className={styles.scorePlayerName}>{playerO ? playerO.username : 'Parceiro 2'}</span>
          <div className={`${styles.truthBadgeContainer} ${truthsCount[playerO?.username] >= 3 ? styles.truthBadgeBlocked : ''}`}>
            <span>😇 Verdades:</span>
            <span>{Math.max(0, 3 - (truthsCount[playerO?.username] || 0))}/3</span>
          </div>
          <span className={styles.scoreValue}>+{scores[playerO?.username] || 0} pts</span>
        </div>
      </div>

      {/* Painel de Definições de Nível e Modo */}
      <div className={styles.controlPanel}>
        <div className={styles.controlRow}>
          <span className={styles.controlLabel}>
            🎯 {language === 'pt' ? 'Nível de Intensidade:' : 'Intensity Level:'}
          </span>
          <div className={styles.levelGroup}>
            <button
              className={`${styles.levelBtn} ${currentLevel === 'easy' ? styles.levelActiveEasy : ''}`}
              onClick={() => handleSettingsChange('easy', currentMode)}
            >
              🌸 {language === 'pt' ? 'Fácil' : 'Easy'}
            </button>
            <button
              className={`${styles.levelBtn} ${currentLevel === 'medium' ? styles.levelActiveMedium : ''}`}
              onClick={() => handleSettingsChange('medium', currentMode)}
            >
              🌶️ {language === 'pt' ? 'Médio' : 'Medium'}
            </button>
            <button
              className={`${styles.levelBtn} ${currentLevel === 'hard' ? styles.levelActiveHard : ''}`}
              onClick={() => handleSettingsChange('hard', currentMode)}
            >
              🔥🔞 {language === 'pt' ? 'Difícil' : 'Hard'}
            </button>
          </div>
        </div>

        <div className={styles.controlRow}>
          <span className={styles.controlLabel}>
            🤖 {language === 'pt' ? 'Modo de Geração:' : 'Generation Mode:'}
          </span>
          <div className={styles.modeGroup}>
            <button
              className={`${styles.modeBtn} ${currentMode === 'ai' ? styles.modeActive : ''}`}
              onClick={() => handleSettingsChange(currentLevel, 'ai')}
            >
              🤖 {language === 'pt' ? 'Inteligência Artificial (Gemini)' : 'AI Mode'}
            </button>
            <button
              className={`${styles.modeBtn} ${currentMode === 'manual' ? styles.modeActive : ''}`}
              onClick={() => handleSettingsChange(currentLevel, 'manual')}
            >
              ✍️ {language === 'pt' ? 'Manual' : 'Manual'}
            </button>
          </div>
        </div>
      </div>

      {/* Área Central de Jogo */}
      <div className={styles.gameArea}>
        {/* Caso 1: Nenhuma carta pendente (Tirar nova carta) */}
        {(!activeCard || activeCard.status === 'completed') && (
          <div className={styles.drawSelectionBox}>
            {currentMode === 'manual' && (
              <input
                type="text"
                className={styles.customTextInput}
                placeholder={language === 'pt' ? 'Escreve um desafio/pergunta personalizada (opcional)...' : 'Write a custom truth/dare (optional)...'}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            )}

            <div className={styles.drawButtonsGrid}>
              <button
                className={styles.btnTruth}
                disabled={isTruthBlocked || submitting}
                onClick={() => handleDraw('truth')}
              >
                <span>😇 {language === 'pt' ? 'VERDADE' : 'TRUTH'}</span>
                <span className={styles.btnSubtext}>
                  {isTruthBlocked
                    ? (language === 'pt' ? '🔒 3 Verdades Esgotadas' : '🔒 3 Used')
                    : (language === 'pt' ? `Restam ${myTruthsRemaining}/3` : `${myTruthsRemaining}/3 Left`)}
                </span>
              </button>

              <button
                className={styles.btnDare}
                disabled={submitting}
                onClick={() => handleDraw('dare')}
              >
                <span>😈 {language === 'pt' ? 'CONSEQUÊNCIA' : 'DARE'}</span>
                <span className={styles.btnSubtext}>
                  {currentLevel === 'hard' ? '🔥🔞 Apimentado' : currentLevel === 'medium' ? '🌶️ Atrevido' : '🌸 Divertido'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Caso 2: Carta Pendente */}
        {activeCard && activeCard.status === 'pending' && (
          <div className={styles.activeCardWrapper}>
            <div className={styles.cardContainer}>
              <div className={`${styles.cardHeaderTag} ${activeCard.type === 'truth' ? styles.tagTruth : styles.tagDare} ${activeCard.level === 'hard' ? styles.tagHard : ''}`}>
                {activeCard.type === 'truth' ? '😇 VERDADE' : '😈 CONSEQUÊNCIA'}
                {activeCard.level === 'hard' ? ' 🔥🔞' : activeCard.level === 'medium' ? ' 🌶️' : ' 🌸'}
              </div>

              <div className={styles.cardTextContent}>
                "{activeCard.content}"
              </div>

              <div className={styles.cardMeta}>
                👤 {activeCard.drawnBy} {language === 'pt' ? 'tirou para' : 'drew for'} {activeCard.targetUser}
                {activeCard.aiGenerated && ' • 🤖 IA Gemini'}
              </div>

              <div className={styles.cardActionsRow}>
                <button
                  className={styles.btnComplete}
                  onClick={handleComplete}
                  disabled={submitting}
                >
                  ✅ {language === 'pt' ? 'Cumprir (+10 pts)' : 'Complete (+10 pts)'}
                </button>
                <button
                  className={styles.btnRefuse}
                  onClick={handleRefuse}
                  disabled={submitting}
                >
                  ❌ {language === 'pt' ? 'Recusar' : 'Refuse'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Caso 3: Penalização Obrigatória */}
        {activeCard && activeCard.status === 'penalty' && (
          <div className={styles.activeCardWrapper}>
            <div className={styles.penaltyCardContainer}>
              <div className={styles.penaltyTitle}>
                🚨 PENALIZAÇÃO OBRIGATÓRIA INEGOCIÁVEL 🔥🔞
              </div>

              <div className={styles.penaltyText}>
                "{activeCard.penaltyContent}"
              </div>

              <button
                className={styles.btnCompletePenalty}
                onClick={handleCompletePenalty}
                disabled={submitting}
              >
                🏆 {language === 'pt' ? 'CUMPRI A PENALIZAÇÃO!' : 'I COMPLIED WITH PENALTY!'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Histórico das Últimas Cartas */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyTitle}>
            📜 {language === 'pt' ? 'Histórico de Cartas Anteriores' : 'Card History'}
          </div>
          <div className={styles.historyList}>
            {history.map((h, i) => (
              <div key={`hist-${i}`} className={styles.historyItem}>
                <span>
                  <strong>{h.type === 'truth' ? '😇' : '😈'} {h.drawnBy}:</strong> "{h.content}"
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {h.level === 'hard' ? '🔥' : h.level === 'medium' ? '🌶️' : '🌸'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
