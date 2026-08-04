import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { gameSessionService } from '../../../services/fun/gameSessionService';
import styles from './TicTacToe.module.css';

export default function TicTacToe() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const meuNome = localStorage.getItem('nome') || '';

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gameSessionService.joinSession('tic-tac-toe');
      setSession(data);
    } catch (err) {
      showToast(err.message || 'Erro ao carregar o Jogo do Galo', 'error');
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
      if (updatedState && updatedState.gameType === 'tic-tac-toe') {
        setSession(updatedState);
      }
    };

    socket.on('tic-tac-toe-update', handleUpdate);

    return () => {
      socket.off('tic-tac-toe-update', handleUpdate);
    };
  }, [socket]);

  const handleCellClick = async (index) => {
    if (!session || session.state.status !== 'playing' || submitting) return;

    const myPlayer = session.players.find(p => p.username === meuNome);
    if (!myPlayer) {
      showToast('Estás em modo visualização.', 'warning');
      return;
    }

    if (myPlayer.symbol !== session.state.currentTurn) {
      showToast(language === 'pt' ? 'Aguarde pelo turno do parceiro!' : "Wait for your partner's turn!", 'warning');
      return;
    }

    if (session.state.board[index] !== null) return;

    try {
      setSubmitting(true);
      const updated = await gameSessionService.makeMove('tic-tac-toe', index);
      setSession(updated);
    } catch (err) {
      showToast(err.message || 'Erro ao fazer a jogada', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setSubmitting(true);
      const updated = await gameSessionService.resetSession('tic-tac-toe');
      setSession(updated);
      showToast(language === 'pt' ? 'Jogo reiniciado!' : 'Game restarted!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao reiniciar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container fade-in">
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>❌⭕</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A preparar o tabuleiro...' : 'Preparing board...'}
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
  const board = session?.state?.board || Array(9).fill(null);
  const scores = session?.state?.scores || { X: 0, O: 0, draws: 0 };

  const isMyTurn = myPlayer && myPlayer.symbol === currentTurn && status === 'playing';
  const currentTurnUsername = currentTurn === 'X' ? playerX?.username : playerO?.username;

  let turnMessage = '';
  if (status === 'waiting') {
    turnMessage = language === 'pt' ? '⏳ A aguardar entrada do parceiro...' : '⏳ Waiting for partner to join...';
  } else if (status === 'playing') {
    if (isMyTurn) {
      turnMessage = language === 'pt' ? '✨ É o teu turno! Faz a tua jogada.' : "✨ It's your turn! Make your move.";
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

  return (
    <div className={`app-container fade-in ${styles.ticTacToeContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>❌⭕</span> {language === 'pt' ? 'Jogo do Galo' : 'Tic-Tac-Toe'}
        </h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Placares e Jogadores */}
      <div className={styles.scoreBanner}>
        <div className={styles.scoreBox}>
          <span className={`${styles.scoreSymbol} ${styles.symbolX}`}>❌</span>
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
          <span className={`${styles.scoreSymbol} ${styles.symbolO}`}>⭕</span>
          <span className={styles.scorePlayerName}>
            {playerO ? playerO.username : '---'}
          </span>
          <span className={styles.scoreValue}>{scores.O}</span>
        </div>
      </div>

      {/* Indicador de Turno / Estado */}
      <div className={`${styles.turnIndicator} ${isMyTurn ? styles.myTurn : (status === 'waiting' ? styles.waitingPartner : styles.partnerTurn)}`}>
        {turnMessage}
      </div>

      {/* Grelha 3x3 */}
      <div className={styles.boardGrid}>
        {board.map((cellValue, idx) => {
          const isWinningCell = winningLine.includes(idx);
          return (
            <button
              key={idx}
              className={`${styles.cell} ${isWinningCell ? styles.winningCell : ''}`}
              onClick={() => handleCellClick(idx)}
              disabled={status !== 'playing' || !isMyTurn || cellValue !== null || submitting}
            >
              {cellValue === 'X' && <span className={styles.cellTextX}>❌</span>}
              {cellValue === 'O' && <span className={styles.cellTextO}>⭕</span>}
            </button>
          );
        })}
      </div>

      {/* Ações */}
      <div className={styles.actionsArea}>
        <button
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={submitting}
        >
          <span>🔄</span> {language === 'pt' ? 'Nova Partida' : 'New Game'}
        </button>

        {session?.state?.activeChallenge && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
            border: '2px solid #ef4444',
            borderRadius: '20px',
            padding: '1.25rem',
            marginTop: '1rem',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontWeight: 900 }}>
              😈 PUNICAO IA PARA O DERROTADO!
            </h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0' }}>
              "{session.state.activeChallenge.challengeText}"
            </p>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              👑 {session.state.activeChallenge.winner} venceu {session.state.activeChallenge.loser}! • 🤖 Gemini IA
            </span>
          </div>
        )}

        <div className={styles.rewardInfoCard}>
          🎁 <span className={styles.rewardHighlight}>Pontuação:</span> Vitória = <strong>50 pts</strong> | Consolação = <strong>10 pts</strong> | Empate = <strong>20 pts</strong>
        </div>
      </div>
    </div>
  );
}
