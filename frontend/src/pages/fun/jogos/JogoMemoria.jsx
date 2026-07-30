import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { photoService } from '../../../services/gallery/photoService';
import { gameScoreService } from '../../../services/fun/gameScoreService';
import styles from './JogoMemoria.module.css';

const DEFAULT_EMOJIS = ['💖', '💍', '👩‍❤️‍👨', '🌹', '✈️', '🍷'];

export default function JogoMemoria() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const initGame = useCallback(async () => {
    try {
      setLoading(true);
      setFlippedIndices([]);
      setMatchedIds([]);
      setMoves(0);
      setSeconds(0);
      setIsActive(false);
      setGameCompleted(false);
      setEarnedPoints(0);

      let itemsToUse = [];

      try {
        const photoRes = await photoService.getPhotos(1, 20);
        const fetchedPhotos = photoRes.data || (Array.isArray(photoRes) ? photoRes : []);
        if (fetchedPhotos.length >= 6) {
          itemsToUse = fetchedPhotos.slice(0, 6).map(p => ({
            type: 'image',
            content: p.url
          }));
        }
      } catch (err) {
        console.warn('Usar emojis fallback para Jogo da Memória');
      }

      if (itemsToUse.length < 6) {
        itemsToUse = DEFAULT_EMOJIS.map(emoji => ({
          type: 'emoji',
          content: emoji
        }));
      }

      // Duplicar para criar pares (12 cartas)
      const deck = [];
      itemsToUse.forEach((item, pairId) => {
        deck.push({ id: `${pairId}-a`, pairId, ...item });
        deck.push({ id: `${pairId}-b`, pairId, ...item });
      });

      // Baralhar cartas
      const shuffled = deck.sort(() => Math.random() - 0.5);
      setCards(shuffled);
    } catch (err) {
      showToast('Erro ao iniciar jogo da memória', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Cronómetro
  useEffect(() => {
    let interval = null;
    if (isActive && !gameCompleted) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, gameCompleted]);

  const handleCardClick = (index) => {
    if (loading || gameCompleted || flippedIndices.length >= 2) return;
    if (flippedIndices.includes(index) || matchedIds.includes(cards[index].pairId)) return;

    if (!isActive) {
      setIsActive(true);
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Encontrou um par!
        const newMatched = [...matchedIds, firstCard.pairId];
        setMatchedIds(newMatched);
        setFlippedIndices([]);

        // Se completou todos os 6 pares!
        if (newMatched.length === 6) {
          handleVictory(moves + 1, seconds);
        }
      } else {
        // Não é par -> virar ao fim de 1 segundo
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleVictory = async (finalMoves, finalSeconds) => {
    setGameCompleted(true);
    setIsActive(false);

    // Cálculo de pontuação: base 50 + bónus por eficiência (máximo 100)
    let points = 50;
    if (finalMoves <= 10) points += 30;
    else if (finalMoves <= 14) points += 15;

    if (finalSeconds <= 30) points += 20;
    else if (finalSeconds <= 60) points += 10;

    points = Math.min(points, 100);
    setEarnedPoints(points);

    try {
      await gameScoreService.submitScore('memory', points, {
        moves: finalMoves,
        timeSeconds: finalSeconds
      });
      showToast(`Parabéns! Ganhaste +${points} pontos para o casal! 🏆`, 'success');
    } catch (err) {
      showToast('Jogo concluído!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="app-container fade-in">
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>🧠</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A baralhar as cartas do casal...' : 'Shuffling memory cards...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container fade-in ${styles.memoryContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>🧠</span> {language === 'pt' ? 'Jogo da Memória' : 'Memory Game'}
        </h1>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Barra de Estatísticas */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>{language === 'pt' ? 'Jogadas' : 'Moves'}</span>
          <span className={styles.statValue}>{moves}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>{language === 'pt' ? 'Tempo' : 'Time'}</span>
          <span className={styles.statValue}>{seconds}s</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>{language === 'pt' ? 'Pares' : 'Pairs'}</span>
          <span className={styles.statValue}>{matchedIds.length} / 6</span>
        </div>
      </div>

      {/* Cartão de Vitória se concluído */}
      {gameCompleted ? (
        <div className={styles.victoryCard}>
          <h2 className={styles.victoryTitle}>🎉 {language === 'pt' ? 'Memória Incrível!' : 'Awesome Memory!'}</h2>
          <p className={styles.victorySub}>
            {language === 'pt'
              ? `Completaste o jogo em ${moves} jogadas e ${seconds} segundos.`
              : `You completed the game in ${moves} moves and ${seconds} seconds.`}
          </p>
          <div className={styles.rewardBadge}>
            🏆 +{earnedPoints} {language === 'pt' ? 'Pontos de Casal' : 'Couple Points'}
          </div>
          <div>
            <button className={styles.restartBtn} onClick={initGame}>
              <span>🔄</span> {language === 'pt' ? 'Jogar Novamente' : 'Play Again'}
            </button>
          </div>
        </div>
      ) : (
        /* Grelha de Cartas */
        <div className={styles.cardsGrid}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedIds.includes(card.pairId);

            return (
              <div
                key={card.id}
                className={`${styles.cardWrapper} ${isFlipped ? styles.flipped : ''} ${isMatched ? styles.matched : ''}`}
                onClick={() => handleCardClick(idx)}
              >
                <div className={styles.cardInner}>
                  {/* Frente (costas da carta fechada) */}
                  <div className={styles.cardFront}>
                    ❤️
                  </div>
                  {/* Trás (conteúdo revelado) */}
                  <div className={styles.cardBack}>
                    {card.type === 'image' ? (
                      <img src={card.content} alt="Memória" className={styles.cardImage} />
                    ) : (
                      <span>{card.content}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!gameCompleted && (
        <div className={styles.actionsArea}>
          <button className={styles.restartBtn} onClick={initGame}>
            <span>🔄</span> {language === 'pt' ? 'Reiniciar Cartas' : 'Restart Deck'}
          </button>
        </div>
      )}
    </div>
  );
}
