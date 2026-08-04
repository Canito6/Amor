import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { wordleService } from '../../../services/fun/wordleService';
import { triggerVictoryConfetti } from '../../../utils/confettiUtils';
import InvitePartnerButton from '../../../components/fun/InvitePartnerButton';
import { triggerHapticFeedback } from '../../../utils/hapticUtils';
import styles from './Wordle.module.css';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

export default function Wordle() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentGuess, setCurrentGuess] = useState('');

  // Modo Manual: palavra personalizada (partilhada, jogada em conjunto)
  const [manualWordInput, setManualWordInput] = useState('');
  const [manualHintInput, setManualHintInput] = useState('');

  // Modo Duelo: palavra que EU escolho para o MEU PARCEIRO adivinhar
  const [duelWordInput, setDuelWordInput] = useState('');
  const [duelHintInput, setDuelHintInput] = useState('');

  const meuNome = localStorage.getItem('nome') || '';

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wordleService.joinSession();
      setSession(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Erro ao carregar o Wordle', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updatedSession) => {
      if (updatedSession && updatedSession.gameType === 'wordle') {
        setSession(updatedSession);

        const st = updatedSession.state;
        if (st?.mode === 'duel') {
          if (st?.status === 'finished' && st?.duel?.winnerOverall === meuNome) {
            triggerVictoryConfetti();
          }
        } else if (st?.status === 'finished' && st?.winner === meuNome) {
          triggerVictoryConfetti();
        }
      }
    };

    socket.on('wordle-update', handleUpdate);

    return () => {
      socket.off('wordle-update', handleUpdate);
    };
  }, [socket, meuNome]);

  const isDuel = session?.state?.mode === 'duel';

  const handleKeyPress = (key) => {
    if (submitting || !session) return;

    const state = session.state || {};
    const canType = isDuel
      ? (state.status === 'playing' && !state.duel?.finishedFor?.[meuNome])
      : state.status === 'playing';

    if (!canType) return;

    triggerHapticFeedback('light');
    const targetLength = isDuel
      ? (state.duel?.wordFor?.[meuNome]?.length || 5)
      : (state.wordLength || 5);

    if (key === 'DEL' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      if (currentGuess.length !== targetLength) {
        showToast(language === 'pt' ? `A palavra deve ter ${targetLength} letras!` : `Word must be ${targetLength} letters!`, 'warning');
        return;
      }
      submitGuess(currentGuess);
    } else if (/^[A-ZÇ]$/i.test(key)) {
      if (currentGuess.length < targetLength) {
        setCurrentGuess(prev => (prev + key).toUpperCase());
      }
    }
  };

  const submitGuess = async (guess) => {
    try {
      setSubmitting(true);
      const updated = isDuel
        ? await wordleService.makeDuelGuess(guess)
        : await wordleService.makeGuess(guess);
      setSession(updated);
      setCurrentGuess('');
    } catch (err) {
      showToast(err.message || 'Erro ao submeter tentativa', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetManualWord = async () => {
    if (!manualWordInput.trim()) return;

    try {
      setSubmitting(true);
      const updated = await wordleService.setManualWord(manualWordInput, manualHintInput);
      setSession(updated);
      setManualWordInput('');
      setManualHintInput('');
      showToast(language === 'pt' ? 'Palavra secreta definida para o teu parceiro adivinhar! 🔤' : 'Secret word set for your partner!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao definir palavra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDuelWord = async () => {
    if (!duelWordInput.trim()) return;

    try {
      setSubmitting(true);
      const updated = await wordleService.setDuelWord(duelWordInput, duelHintInput);
      setSession(updated);
      setDuelWordInput('');
      setDuelHintInput('');
      showToast(language === 'pt' ? 'Palavra secreta enviada para o teu parceiro! 🔒' : 'Secret word sent to your partner!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao definir palavra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetMode = async (mode) => {
    if (submitting || session?.state?.mode === mode) return;
    try {
      setSubmitting(true);
      setCurrentGuess('');
      const updated = await wordleService.updateSettings(mode);
      setSession(updated);
    } catch (err) {
      showToast(err.message || 'Erro ao mudar de modo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetGame = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setCurrentGuess('');
      const updated = await wordleService.resetGame();
      setSession(updated);
      showToast(language === 'pt' ? 'Nova palavra secreta gerada! 🚀' : 'New secret word generated!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao reiniciar Wordle', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`app-container fade-in ${styles.wordleContainer}`}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>🔤💚</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A carregar o Wordle a Dois...' : 'Loading Wordle...'}
          </p>
        </div>
      </div>
    );
  }

  const state = session?.state || {};
  const status = state.status || 'playing';
  const players = session?.players || [];
  const partner = players.find(p => p.username !== meuNome);
  const duel = state.duel || {};

  // Valores a apresentar na grelha/teclado: dependem do modo (conjunto vs duelo)
  let targetLength, attempts, hint, canGuess;
  if (isDuel) {
    targetLength = duel.wordFor?.[meuNome]?.length || 5;
    attempts = duel.attemptsFor?.[meuNome] || [];
    hint = duel.hintFor?.[meuNome] || (language === 'pt' ? 'Palavra escolhida pelo teu par' : "Word chosen by your partner");
    canGuess = status === 'playing' && !!duel.wordFor?.[meuNome] && !duel.finishedFor?.[meuNome];
  } else {
    targetLength = state.wordLength || 5;
    attempts = state.attempts || [];
    hint = state.hint || 'Palavra romântica do casal';
    canGuess = status === 'playing';
  }
  const maxAttempts = state.maxAttempts || 6;

  // Mapeamento de estado das teclas no teclado virtual
  const keyStatuses = {};
  attempts.forEach(att => {
    att.word.split('').forEach((char, idx) => {
      const res = att.result[idx]; // 'correct' | 'present' | 'absent'
      if (res === 'correct') {
        keyStatuses[char] = 'correct';
      } else if (res === 'present' && keyStatuses[char] !== 'correct') {
        keyStatuses[char] = 'present';
      } else if (res === 'absent' && !keyStatuses[char]) {
        keyStatuses[char] = 'absent';
      }
    });
  });

  const iHaveSetWordForPartner = isDuel && partner && !!duel.wordFor?.[partner.username];
  const showGrid = !isDuel || (status === 'playing' || status === 'finished');

  return (
    <div className={`app-container fade-in ${styles.wordleContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>🔤</span> {language === 'pt' ? 'Wordle a Dois' : 'Couple Wordle'}
        </h1>
        <InvitePartnerButton gameName="Wordle a Dois" gameRoute="/jogos/wordle" />
      </div>

      {/* Seletor de Modo: Conjunto (palavra partilhada, IA) vs Duelo (cada um escolhe para o outro) */}
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '450px', marginBottom: '1rem' }}>
        <button
          className="btn btn-dark"
          style={{ flex: 1, background: !isDuel ? '#10b981' : undefined, opacity: !isDuel ? 1 : 0.6 }}
          onClick={() => handleSetMode('ai')}
          disabled={submitting}
        >
          🤝 {language === 'pt' ? 'Modo Conjunto' : 'Joint Mode'}
        </button>
        <button
          className="btn btn-dark"
          style={{ flex: 1, background: isDuel ? '#ef4444' : undefined, opacity: isDuel ? 1 : 0.6 }}
          onClick={() => handleSetMode('duel')}
          disabled={submitting}
        >
          ⚔️ {language === 'pt' ? 'Modo Duelo' : 'Duel Mode'}
        </button>
      </div>

      {!isDuel && (
        <p style={{ fontSize: '0.8rem', opacity: 0.75, textAlign: 'center', maxWidth: '420px', marginBottom: '1rem' }}>
          {language === 'pt'
            ? 'Ambos tentam adivinhar a mesma palavra secreta, em conjunto, no mesmo tabuleiro.'
            : 'You both try to guess the same secret word together, on the same board.'}
        </p>
      )}
      {isDuel && (
        <p style={{ fontSize: '0.8rem', opacity: 0.75, textAlign: 'center', maxWidth: '420px', marginBottom: '1rem' }}>
          {language === 'pt'
            ? 'Cada um escolhe uma palavra secreta para o outro adivinhar, em simultâneo. Quem acertar com menos tentativas, ganha!'
            : "Each of you picks a secret word for the other to guess, at the same time. Whoever solves it in fewer attempts wins!"}
        </p>
      )}

      {/* Card de Dica */}
      {(!isDuel || status === 'playing' || status === 'finished') && (
        <div className={styles.hintCard}>
          💡 {hint}
          {state.mode === 'ai' && ' • 🤖 IA Gemini'}
        </div>
      )}

      {/* MODO MANUAL (partilhado): DEFINIR PALAVRA PARA O PARCEIRO */}
      {!isDuel && status === 'setting' && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px', width: '100%', maxWidth: '450px', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#10b981', textAlign: 'center' }}>
            ✍️ {language === 'pt' ? 'Escreve a Palavra Secreta' : 'Set Secret Word'}
          </h3>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: BEIJO"
            value={manualWordInput}
            onChange={(e) => setManualWordInput(e.target.value.toUpperCase())}
            maxLength={8}
            style={{ marginBottom: '0.85rem' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Dica (opcional)..."
            value={manualHintInput}
            onChange={(e) => setManualHintInput(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSetManualWord} disabled={submitting}>
            🚀 {language === 'pt' ? 'Definir Palavra' : 'Set Word'}
          </button>
        </div>
      )}

      {/* MODO DUELO: DEFINIR PALAVRA PARA O PARCEIRO ADIVINHAR */}
      {isDuel && status === 'setting-duel' && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px', width: '100%', maxWidth: '450px', marginBottom: '1.5rem' }}>
          {!iHaveSetWordForPartner ? (
            <>
              <h3 style={{ margin: '0 0 1rem 0', color: '#ef4444', textAlign: 'center' }}>
                ⚔️ {language === 'pt'
                  ? `Escreve a Palavra Secreta para ${partner?.username || 'o teu par'}`
                  : `Write the Secret Word for ${partner?.username || 'your partner'}`}
              </h3>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: BEIJO"
                value={duelWordInput}
                onChange={(e) => setDuelWordInput(e.target.value.toUpperCase())}
                maxLength={8}
                style={{ marginBottom: '0.85rem' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Dica (opcional)..."
                value={duelHintInput}
                onChange={(e) => setDuelHintInput(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSetDuelWord} disabled={submitting}>
                🔒 {language === 'pt' ? 'Enviar Palavra Secreta' : 'Send Secret Word'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="pulsing-heart" style={{ fontSize: '2rem' }}>⏳</div>
              <p style={{ marginTop: '0.5rem' }}>
                {language === 'pt'
                  ? `Palavra enviada! A aguardar que ${partner?.username || 'o teu par'} defina a tua palavra...`
                  : `Word sent! Waiting for ${partner?.username || 'your partner'} to set your word...`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* GRELHA DO WORDLE (6 TENTATIVAS X TARGETLENGTH) */}
      {showGrid && (
        <div className={styles.wordleGrid}>
          {Array(maxAttempts).fill(null).map((_, rowIdx) => {
            const attempt = attempts[rowIdx];
            const isCurrentRow = rowIdx === attempts.length && canGuess;

            let rowChars = Array(targetLength).fill('');
            if (attempt) {
              rowChars = attempt.word.split('');
            } else if (isCurrentRow) {
              rowChars = currentGuess.padEnd(targetLength, '').split('');
            }

            return (
              <div key={`row-${rowIdx}`} className={styles.wordleRow}>
                {rowChars.map((char, colIdx) => {
                  let resultClass = '';
                  if (attempt) {
                    const res = attempt.result[colIdx];
                    if (res === 'correct') resultClass = styles.tileCorrect;
                    if (res === 'present') resultClass = styles.tilePresent;
                    if (res === 'absent') resultClass = styles.tileAbsent;
                  }

                  return (
                    <div key={`tile-${rowIdx}-${colIdx}`} className={`${styles.wordleTile} ${resultClass}`}>
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* TECLADO VIRTUAL */}
      {canGuess && (
        <div className={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={`krow-${rIdx}`} className={styles.keyboardRow}>
              {row.map(key => {
                const statusKey = keyStatuses[key];
                let keyStyle = '';
                if (statusKey === 'correct') keyStyle = styles.keyCorrect;
                if (statusKey === 'present') keyStyle = styles.keyPresent;
                if (statusKey === 'absent') keyStyle = styles.keyAbsent;
                if (key === 'ENTER' || key === 'DEL') keyStyle += ` ${styles.keyWide}`;

                return (
                  <button
                    key={key}
                    className={`${styles.keyBtn} ${keyStyle}`}
                    onClick={() => handleKeyPress(key)}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {isDuel && status === 'playing' && duel.finishedFor?.[meuNome] && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p>
            ⏳ {language === 'pt'
              ? `Terminaste o teu lado do duelo! A aguardar que ${partner?.username || 'o teu par'} acabe...`
              : `You finished your side of the duel! Waiting for ${partner?.username || 'your partner'} to finish...`}
          </p>
        </div>
      )}

      {/* RESULTADO FINAL & REINICIAR (MODO CONJUNTO) */}
      {!isDuel && status === 'finished' && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <h2 style={{ color: state.winner === 'none' ? '#ef4444' : '#10b981' }}>
            {state.winner === 'none'
              ? (language === 'pt' ? `❌ A palavra era "${state.secretWord}"!` : `❌ Word was "${state.secretWord}"!`)
              : (language === 'pt' ? `🏆 ${state.winner} acertou a palavra "${state.secretWord}" (+50 pts)!` : `🏆 ${state.winner} guessed "${state.secretWord}" (+50 pts)!`)}
          </h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleResetGame} disabled={submitting}>
            🔄 {language === 'pt' ? 'Jogar Novamente' : 'Play Again'}
          </button>
        </div>
      )}

      {/* RESULTADO FINAL & REINICIAR (MODO DUELO) */}
      {isDuel && status === 'finished' && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <h2 style={{ color: duel.winnerOverall === 'draw' ? '#f59e0b' : '#10b981' }}>
            {duel.winnerOverall === 'draw'
              ? (language === 'pt' ? '🤝 Duelo empatado!' : '🤝 Duel ended in a draw!')
              : (language === 'pt' ? `🏆 ${duel.winnerOverall} venceu o duelo! (+50 pts)` : `🏆 ${duel.winnerOverall} won the duel! (+50 pts)`)}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            {players.map(p => {
              const pAttempts = duel.attemptsFor?.[p.username] || [];
              const pWord = duel.wordFor?.[p.username];
              const pSolved = pAttempts.length > 0 && pAttempts[pAttempts.length - 1].result.every(r => r === 'correct');
              return (
                <div key={p.username} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', minWidth: '160px' }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{p.username}</p>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', opacity: 0.85 }}>
                    {language === 'pt' ? 'Palavra a adivinhar:' : 'Word to guess:'} <strong>{pWord}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    {pSolved
                      ? (language === 'pt' ? `✅ Acertou em ${pAttempts.length} tentativa(s)` : `✅ Solved in ${pAttempts.length} attempt(s)`)
                      : (language === 'pt' ? '❌ Não acertou' : '❌ Did not solve')}
                  </p>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={handleResetGame} disabled={submitting}>
            🔄 {language === 'pt' ? 'Novo Duelo' : 'New Duel'}
          </button>
        </div>
      )}
    </div>
  );
}
