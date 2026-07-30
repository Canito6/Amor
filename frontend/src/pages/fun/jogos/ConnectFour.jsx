import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { gameSessionService } from '../../../services/fun/gameSessionService';
import { triggerVictoryConfetti } from '../../../utils/confettiUtils';
import styles from './ConnectFour.module.css';

const EMOJI_OPTIONS = ['💖', '💙', '⭐', '👑', '🐱', '🐶', '🔥', '🍓', '🦄', '💎', '⚡', '🥑', '🍕', '🐻', '🌸'];

const COLOR_OPTIONS = [
  { id: 'pink', name: 'Rosa Néon', bg: 'radial-gradient(circle at 35% 35%, #ff7aa8, #ff2a70)' },
  { id: 'blue', name: 'Azul Elétrico', bg: 'radial-gradient(circle at 35% 35%, #4cc9f0, #0096c7)' },
  { id: 'purple', name: 'Roxo Mágico', bg: 'radial-gradient(circle at 35% 35%, #c77dff, #7b2cbf)' },
  { id: 'green', name: 'Verde Esmeralda', bg: 'radial-gradient(circle at 35% 35%, #52b788, #1b4332)' },
  { id: 'gold', name: 'Dourado Brilhante', bg: 'radial-gradient(circle at 35% 35%, #ffe066, #f59e0b)' },
  { id: 'orange', name: 'Laranja Sol', bg: 'radial-gradient(circle at 35% 35%, #ff9e00, #e85d04)' },
  { id: 'dark', name: 'Preto Galáctico', bg: 'radial-gradient(circle at 35% 35%, #6c757d, #212529)' }
];

export default function ConnectFour() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const meuNome = localStorage.getItem('nome') || '';

  const [myEmoji, setMyEmoji] = useState(() => localStorage.getItem(`c4_emoji_${meuNome}`) || '💖');
  const [myColor, setMyColor] = useState(() => localStorage.getItem(`c4_color_${meuNome}`) || 'pink');

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gameSessionService.joinSession('connect-four');
      setSession(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Erro ao carregar o 4 em Linha', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Escutar atualizações do socket em tempo real
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updatedState) => {
      if (updatedState && updatedState.gameType === 'connect-four') {
        setSession(updatedState);
        if (updatedState.state?.status === 'finished' && updatedState.state?.winner) {
          const players = updatedState.players || [];
          const winnerPlayer = players.find(p => p.symbol === updatedState.state.winner);
          if (winnerPlayer && winnerPlayer.username === meuNome) {
            triggerVictoryConfetti();
          }
        }
      }
    };

    socket.on('connect-four-update', handleUpdate);

    return () => {
      socket.off('connect-four-update', handleUpdate);
    };
  }, [socket, meuNome]);

  const handleUpdateCustomization = async (newEmoji, newColor) => {
    setMyEmoji(newEmoji);
    setMyColor(newColor);
    localStorage.setItem(`c4_emoji_${meuNome}`, newEmoji);
    localStorage.setItem(`c4_color_${meuNome}`, newColor);

    try {
      const updated = await gameSessionService.updateCustomization('connect-four', {
        emoji: newEmoji,
        color: newColor
      });
      setSession(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDropPiece = async (colIndex) => {
    if (!session || session.state.status !== 'playing' || submitting) return;

    const myPlayer = session.players.find(p => p.username === meuNome);
    if (!myPlayer) {
      showToast('Estás em modo visualização.', 'warning');
      return;
    }

    if (myPlayer.symbol !== session.state.currentTurn) {
      showToast('Aguarde pelo turno do teu parceiro!', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await gameSessionService.makeMove('connect-four', colIndex);
      setSession(updated);
    } catch (err) {
      showToast(err.message || 'Erro ao jogar na coluna', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetGame = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const reseted = await gameSessionService.resetSession('connect-four');
      setSession(reseted);
      showToast('Nova partida iniciada! 🚀', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao reiniciar partida', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`app-container fade-in ${styles.connectFourContainer}`}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>🟡🔵</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A preparar o tabuleiro de 4 em Linha...' : 'Preparing Connect 4 board...'}
          </p>
        </div>
      </div>
    );
  }

  const players = session?.players || [];
  const playerX = players.find(p => p.symbol === 'X');
  const playerO = players.find(p => p.symbol === 'O');
  const myPlayer = players.find(p => p.username === meuNome);

  const status = session?.state?.status || 'waiting';
  const currentTurn = session?.state?.currentTurn || 'X';
  const winner = session?.state?.winner;
  const winningLine = session?.state?.winningLine || [];
  const board = session?.state?.board || Array(42).fill(null);
  const scores = session?.state?.scores || { X: 0, O: 0, draws: 0 };
  const customizations = session?.state?.customizations || {};

  // Personalizações de cada jogador
  const customX = (playerX && customizations[playerX.username]) || { emoji: '💖', color: 'pink' };
  const customO = (playerO && customizations[playerO.username]) || { emoji: '💙', color: 'blue' };

  const isMyTurn = myPlayer && myPlayer.symbol === currentTurn && status === 'playing';
  const currentTurnUsername = currentTurn === 'X' ? playerX?.username : playerO?.username;

  let turnMessage = '';
  if (status === 'waiting') {
    turnMessage = language === 'pt' ? '⏳ A aguardar entrada do parceiro...' : '⏳ Waiting for partner to join...';
  } else if (status === 'playing') {
    if (isMyTurn) {
      turnMessage = language === 'pt' ? '✨ É o teu turno! Escolhe uma coluna.' : "✨ It's your turn! Pick a column.";
    } else {
      turnMessage = language === 'pt' ? `⏳ Vez de ${currentTurnUsername || 'parceiro'} jogar...` : `⏳ ${currentTurnUsername || 'Partner'}'s turn...`;
    }
  } else if (status === 'finished') {
    if (winner === 'draw') {
      turnMessage = language === 'pt' ? '🤝 Empate perfeito! 20 pontos para cada um.' : '🤝 Perfect draw! 20 points for each.';
    } else {
      const winnerName = winner === 'X' ? playerX?.username : playerO?.username;
      const isWinner = winnerName === meuNome;
      turnMessage = isWinner
        ? (language === 'pt' ? '🏆 Ganhaste! +50 pontos adicionados!' : '🏆 You won! +50 points added!')
        : (language === 'pt' ? `🎉 ${winnerName} venceu! Ganhaste 10 pontos de consolação.` : `🎉 ${winnerName} won! You got 10 consolation points.`);
    }
  }

  const isColFull = (col) => board[0 * 7 + col] !== null;

  return (
    <div className={`app-container fade-in ${styles.connectFourContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>🟡🔵</span> {language === 'pt' ? '4 em Linha' : 'Connect 4'}
        </h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Placares e Jogadores */}
      <div className={styles.scoreBanner}>
        <div className={styles.scoreBox}>
          <span className={`${styles.scoreSymbol} ${styles[`token_${customX.color}`]}`}>
            {customX.emoji}
          </span>
          <span className={styles.scorePlayerName}>
            {playerX ? playerX.username : '---'}
          </span>
          <span className={styles.scoreValue}>{scores.X}</span>
        </div>

        <div className={styles.scoreDivider}></div>

        <div className={styles.scoreBox}>
          <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'Empates' : 'Draws'}
          </span>
          <span className={styles.scoreValue}>{scores.draws}</span>
        </div>

        <div className={styles.scoreDivider}></div>

        <div className={styles.scoreBox}>
          <span className={`${styles.scoreSymbol} ${styles[`token_${customO.color}`]}`}>
            {customO.emoji}
          </span>
          <span className={styles.scorePlayerName}>
            {playerO ? playerO.username : '---'}
          </span>
          <span className={styles.scoreValue}>{scores.O}</span>
        </div>
      </div>

      {/* Indicador de Turno */}
      <div className={`${styles.turnIndicator} ${
        status === 'waiting'
          ? styles.waitingPartner
          : isMyTurn
            ? styles.myTurn
            : styles.partnerTurn
      }`}>
        {turnMessage}
      </div>

      {/* Botão para Abrir Personalizador */}
      <button
        className={styles.customizeToggleBtn}
        onClick={() => setShowCustomizer(!showCustomizer)}
      >
        🎨 {showCustomizer ? (language === 'pt' ? 'Fechar Personalização' : 'Close Customization') : (language === 'pt' ? 'Personalizar Minha Ficha' : 'Customize My Piece')}
      </button>

      {/* Painel de Personalização */}
      {showCustomizer && (
        <div className={styles.customizationPanel}>
          <div className={styles.customTitle}>
            <span>🎨</span> {language === 'pt' ? 'Personaliza a tua Ficha' : 'Customize Your Piece'}
          </div>

          <div className={styles.customSection}>
            <label className={styles.customLabel}>
              {language === 'pt' ? 'Escolhe a Cor da tua Ficha:' : 'Choose Token Color:'}
            </label>
            <div className={styles.colorPickerGrid}>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  className={`${styles.colorDotBtn} ${myColor === c.id ? styles.colorDotActive : ''}`}
                  style={{ background: c.bg }}
                  title={c.name}
                  onClick={() => handleUpdateCustomization(myEmoji, c.id)}
                />
              ))}
            </div>
          </div>

          <div className={styles.customSection}>
            <label className={styles.customLabel}>
              {language === 'pt' ? 'Escolhe o teu Emoji:' : 'Choose Your Emoji:'}
            </label>
            <div className={styles.emojiPickerGrid}>
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  className={`${styles.emojiBtn} ${myEmoji === emoji ? styles.emojiActive : ''}`}
                  onClick={() => handleUpdateCustomization(emoji, myColor)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabuleiro 4 em Linha */}
      <div className={styles.boardContainer}>
        {/* Barra de Botões para Lançar Peças */}
        <div className={styles.columnDropBar}>
          {[0, 1, 2, 3, 4, 5, 6].map(col => (
            <button
              key={`drop-${col}`}
              className={styles.dropBtn}
              onClick={() => handleDropPiece(col)}
              disabled={!isMyTurn || isColFull(col) || submitting}
              title={`Lançar na coluna ${col + 1}`}
            >
              ⬇️
            </button>
          ))}
        </div>

        {/* Grelha 7 Colunas x 6 Linhas (42 Posições) */}
        <div className={styles.grid7x6}>
          {board.map((symbol, idx) => {
            const isWinning = winningLine.includes(idx);
            const colIndex = idx % 7;
            const custom = symbol === 'X' ? customX : customO;

            return (
              <div
                key={`c4-cell-${idx}`}
                className={`${styles.c4Cell} ${symbol ? styles.occupied : ''} ${isWinning ? styles.winningCell : ''}`}
                onClick={() => isMyTurn && !isColFull(colIndex) && handleDropPiece(colIndex)}
              >
                {symbol === 'X' && (
                  <div className={`${styles.tokenX} ${styles[`token_${custom.color || 'pink'}`]}`}>
                    {custom.emoji || '💖'}
                  </div>
                )}
                {symbol === 'O' && (
                  <div className={`${styles.tokenO} ${styles[`token_${custom.color || 'blue'}`]}`}>
                    {custom.emoji || '💙'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className={styles.actionsArea}>
        {status === 'finished' && (
          <button
            className={styles.resetBtn}
            onClick={handleResetGame}
            disabled={submitting}
          >
            🔄 {language === 'pt' ? 'Jogar Novamente' : 'Play Again'}
          </button>
        )}

        <div className={styles.rewardInfoCard}>
          🏆 {language === 'pt' ? 'Vitória: ' : 'Victory: '}
          <span className={styles.rewardHighlight}>+50 pts</span>
          {' | '}
          {language === 'pt' ? 'Empate: ' : 'Draw: '}
          <span className={styles.rewardHighlight}>+20 pts</span>
          {' | '}
          {language === 'pt' ? 'Participação: ' : 'Participation: '}
          <span className={styles.rewardHighlight}>+10 pts</span>
        </div>
      </div>
    </div>
  );
}
