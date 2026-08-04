import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { wordleService } from '../../../services/fun/wordleService';
import { triggerVictoryConfetti } from '../../../utils/confettiUtils';
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

  // Modo Manual: palavra personalizada
  const [manualWordInput, setManualWordInput] = useState('');
  const [manualHintInput, setManualHintInput] = useState('');

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
        if (updatedSession.state?.status === 'finished' && updatedSession.state?.winner === meuNome) {
          triggerVictoryConfetti();
        }
      }
    };

    socket.on('wordle-update', handleUpdate);

    return () => {
      socket.off('wordle-update', handleUpdate);
    };
  }, [socket, meuNome]);

  const handleKeyPress = (key) => {
    if (submitting || !session || session.state?.status !== 'playing') return;

    const targetLength = session.state?.wordLength || 5;

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
      const updated = await wordleService.makeGuess(guess);
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
  const targetLength = state.wordLength || 5;
  const attempts = state.attempts || [];
  const maxAttempts = state.maxAttempts || 6;
  const status = state.status || 'playing';
  const hint = state.hint || 'Palavra romântica do casal';

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
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Card de Dica */}
      <div className={styles.hintCard}>
        💡 {hint}
        {state.mode === 'ai' && ' • 🤖 IA Gemini'}
      </div>

      {/* MODO MANUAL: DEFINIR PALAVRA PARA O PARCEIRO */}
      {status === 'setting' && (
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

      {/* GRELHA DO WORDLE (6 TENTATIVAS X TARGETLENGTH) */}
      <div className={styles.wordleGrid}>
        {Array(maxAttempts).fill(null).map((_, rowIdx) => {
          const attempt = attempts[rowIdx];
          const isCurrentRow = rowIdx === attempts.length && status === 'playing';

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

      {/* TECLADO VIRTUAL */}
      {status === 'playing' && (
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

      {/* RESULTADO FINAL & REINICIAR */}
      {status === 'finished' && (
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
    </div>
  );
}
