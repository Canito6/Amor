import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { battleshipService } from '../../../services/fun/battleshipService';
import { triggerVictoryConfetti } from '../../../utils/confettiUtils';
import InvitePartnerButton from '../../../components/fun/InvitePartnerButton';
import { triggerHapticFeedback } from '../../../utils/hapticUtils';
import styles from './Battleship.module.css';

export default function Battleship() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { showToast } = useToast();
  const { language } = usePreferences();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estado local para a fase de posicionamento de navios
  const [selectedHeart, setSelectedHeart] = useState([]); // 3 células
  const [selectedBoat, setSelectedBoat] = useState([]);   // 2 células
  const [selectedIsland, setSelectedIsland] = useState([]); // 1 célula
  const [activeShipToPlace, setActiveShipToPlace] = useState('heart'); // 'heart'|'boat'|'island'

  const meuNome = localStorage.getItem('nome') || '';

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await battleshipService.joinSession();
      setSession(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Erro ao carregar Batalha Naval', 'error');
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
      if (updatedSession && updatedSession.gameType === 'battleship') {
        setSession(updatedSession);
        if (updatedSession.state?.status === 'finished' && updatedSession.state?.winner === meuNome) {
          triggerVictoryConfetti();
        }
      }
    };

    socket.on('battleship-update', handleUpdate);

    return () => {
      socket.off('battleship-update', handleUpdate);
    };
  }, [socket, meuNome]);

  const handleCellSetupClick = (idx) => {
    if (selectedHeart.includes(idx) || selectedBoat.includes(idx) || selectedIsland.includes(idx)) {
      // Desmarcar se já estiver selecionado
      setSelectedHeart(prev => prev.filter(i => i !== idx));
      setSelectedBoat(prev => prev.filter(i => i !== idx));
      setSelectedIsland(prev => prev.filter(i => i !== idx));
      return;
    }

    if (activeShipToPlace === 'heart') {
      if (selectedHeart.length < 3) setSelectedHeart(prev => [...prev, idx]);
    } else if (activeShipToPlace === 'boat') {
      if (selectedBoat.length < 2) setSelectedBoat(prev => [...prev, idx]);
    } else if (activeShipToPlace === 'island') {
      if (selectedIsland.length < 1) setSelectedIsland(prev => [...prev, idx]);
    }
  };

  const handleConfirmSetup = async () => {
    if (selectedHeart.length !== 3 || selectedBoat.length !== 2 || selectedIsland.length !== 1) {
      showToast(
        language === 'pt'
          ? 'Posiciona os 3 navios completos: Coração (3), Barco (2) e Ilha (1)!'
          : 'Place all 3 ships: Heart (3), Boat (2), Island (1)!',
        'warning'
      );
      return;
    }

    try {
      setSubmitting(true);
      const shipPlacements = [
        { id: 'heart', indices: selectedHeart },
        { id: 'boat', indices: selectedBoat },
        { id: 'island', indices: selectedIsland }
      ];
      const updated = await battleshipService.placeShips(shipPlacements);
      setSession(updated);
      showToast(language === 'pt' ? 'Frota posicionada com sucesso! ⚓' : 'Fleet placed successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao posicionar frota', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttack = async (idx) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      triggerHapticFeedback('heavy');
      const updated = await battleshipService.attack(idx);
      setSession(updated);
    } catch (err) {
      showToast(err.message || 'Erro ao atacar posição', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissChallenge = async () => {
    try {
      const updated = await battleshipService.dismissChallenge();
      setSession(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetGame = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setSelectedHeart([]);
      setSelectedBoat([]);
      setSelectedIsland([]);
      const updated = await battleshipService.resetGame();
      setSession(updated);
      showToast(language === 'pt' ? 'Nova partida iniciada!' : 'New game started!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao reiniciar partida', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`app-container fade-in ${styles.bsContainer}`}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="pulsing-heart" style={{ fontSize: '3rem' }}>⚓🌊</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' ? 'A preparar a Batalha Naval...' : 'Preparing Battleship...'}
          </p>
        </div>
      </div>
    );
  }

  const players = session?.players || [];
  const state = session?.state || {};
  const status = state.status || 'setup';
  const currentTurn = state.currentTurn;
  const activeChallenge = state.activeChallenge;
  const isMyTurn = currentTurn === meuNome && status === 'playing';

  const partnerPlayer = players.find(p => p.username !== meuNome);
  const partnerUsername = partnerPlayer ? partnerPlayer.username : 'Parceiro(a)';

  const myBoard = (state.boards && state.boards[meuNome]) || Array(36).fill(null);
  const myAttacks = (state.attacks && state.attacks[meuNome]) || {};
  const isReady = state.ready && state.ready[meuNome];

  return (
    <div className={`app-container fade-in ${styles.bsContainer}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 className={styles.headerTitle}>
          <span>⚓</span> {language === 'pt' ? 'Batalha Naval do Amor' : 'Love Battleship'}
        </h1>
        <InvitePartnerButton gameName="Batalha Naval" gameRoute="/jogos/batalha-naval" />
      </div>

      {/* Banner de Estado */}
      <div className={styles.statusBanner}>
        {status === 'setup' && (
          <span>
            {isReady
              ? (language === 'pt' ? '⏳ Frota posicionada! A aguardar pelo parceiro...' : '⏳ Fleet ready! Waiting for partner...')
              : (language === 'pt' ? '⚓ Posiciona a tua frota secreta na grelha abaixo!' : '⚓ Place your secret fleet on the grid!')}
          </span>
        )}

        {status === 'playing' && (
          <span>
            {isMyTurn
              ? (language === 'pt' ? '🎯 É o teu turno de atacar! Escolhe uma posição no Radar.' : "🎯 It's your turn to attack! Pick a spot.")
              : (language === 'pt' ? `⏳ Vez de ${partnerUsername} atacar...` : `⏳ ${partnerUsername}'s turn to attack...`)}
          </span>
        )}

        {status === 'finished' && (
          <span>
            {state.winner === meuNome
              ? (language === 'pt' ? '🏆 VENCESTE A BATALHA NAVAL! +50 Pontos!' : '🏆 YOU WON BATTLESHIP! +50 Points!')
              : (language === 'pt' ? `💣 ${state.winner} afundou a tua frota!` : `💣 ${state.winner} sunk your fleet!`)}
          </span>
        )}
      </div>

      {/* FASE 1: POSICIONAMENTO DE NAVIOS (SETUP) */}
      {status === 'setup' && !isReady && (
        <div className={styles.boardsWrapper}>
          <div className={styles.boardCard}>
            <div className={styles.boardTitle}>
              <span>⚓</span> {language === 'pt' ? 'Posiciona a Tua Frota (Grelha 6x6)' : 'Place Your Fleet'}
            </div>

            {/* Seletor do Navio Ativo a Posicionar */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', justifyContent: 'center' }}>
              <button
                className={`btn ${activeShipToPlace === 'heart' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => setActiveShipToPlace('heart')}
              >
                💘 Coração ({selectedHeart.length}/3)
              </button>
              <button
                className={`btn ${activeShipToPlace === 'boat' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => setActiveShipToPlace('boat')}
              >
                🛥️ Barco ({selectedBoat.length}/2)
              </button>
              <button
                className={`btn ${activeShipToPlace === 'island' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => setActiveShipToPlace('island')}
              >
                🏝️ Ilha ({selectedIsland.length}/1)
              </button>
            </div>

            <div className={styles.grid6x6}>
              {Array(36).fill(null).map((_, idx) => {
                const isHeart = selectedHeart.includes(idx);
                const isBoat = selectedBoat.includes(idx);
                const isIsland = selectedIsland.includes(idx);

                return (
                  <div
                    key={`setup-cell-${idx}`}
                    className={`${styles.bsCell} ${
                      isHeart ? styles.cellShipHeart : isBoat ? styles.cellShipBoat : isIsland ? styles.cellShipIsland : ''
                    }`}
                    onClick={() => handleCellSetupClick(idx)}
                  >
                    {isHeart && '💘'}
                    {isBoat && '🛥️'}
                    {isIsland && '🏝️'}
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
              disabled={selectedHeart.length !== 3 || selectedBoat.length !== 2 || selectedIsland.length !== 1 || submitting}
              onClick={handleConfirmSetup}
            >
              ⚓ {language === 'pt' ? 'Confirmar Posicionamento' : 'Confirm Placement'}
            </button>
          </div>
        </div>
      )}

      {/* FASE 2: ATAQUE EM TEMPO REAL (PLAYING / FINISHED) */}
      {(status === 'playing' || status === 'finished') && (
        <div className={styles.boardsWrapper}>
          {/* Radar de Ataque (Grelha do Adversário) */}
          <div className={styles.boardCard}>
            <div className={styles.boardTitle}>
              <span>🎯</span> {language === 'pt' ? `Radar de Ataque em ${partnerUsername}` : `Attack Radar`}
            </div>

            <div className={styles.grid6x6}>
              {Array(36).fill(null).map((_, idx) => {
                const attackState = myAttacks[idx]; // 'water' | 'hit' | 'sunk'

                return (
                  <div
                    key={`attack-cell-${idx}`}
                    className={`${styles.bsCell} ${
                      attackState === 'water'
                        ? styles.cellWater
                        : attackState === 'hit'
                          ? styles.cellHit
                          : attackState === 'sunk'
                            ? styles.cellSunk
                            : ''
                    } ${!isMyTurn || attackState || submitting ? styles.disabledCell : ''}`}
                    onClick={() => isMyTurn && !attackState && handleAttack(idx)}
                  >
                    {attackState === 'water' && '🌊'}
                    {attackState === 'hit' && '💥'}
                    {attackState === 'sunk' && '💣'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minha Frota (Grelha Própria) */}
          <div className={styles.boardCard}>
            <div className={styles.boardTitle}>
              <span>🛡️</span> {language === 'pt' ? 'A Tua Frota (Defesa)' : 'Your Fleet'}
            </div>

            <div className={styles.grid6x6}>
              {myBoard.map((shipId, idx) => {
                return (
                  <div
                    key={`my-cell-${idx}`}
                    className={`${styles.bsCell} ${
                      shipId === 'heart' ? styles.cellShipHeart : shipId === 'boat' ? styles.cellShipBoat : shipId === 'island' ? styles.cellShipIsland : ''
                    } ${styles.disabledCell}`}
                  >
                    {shipId === 'heart' && '💘'}
                    {shipId === 'boat' && '🛥️'}
                    {shipId === 'island' && '🏝️'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Card de Desafio do Navio Afundado */}
      {activeChallenge && (
        <div className={styles.challengeModalOverlay}>
          <div className={styles.challengeModalCard}>
            <div className={styles.challengeTitle}>
              💣 NAVIO AFUNDADO! ({activeChallenge.shipName})
            </div>

            <div className={styles.challengeText}>
              "{activeChallenge.challengeText}"
            </div>

            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              🎯 {activeChallenge.sunkBy} {language === 'pt' ? 'afundou o navio de' : 'sunk ship of'} {activeChallenge.victim}!
            </div>

            <button
              className={styles.btnDismiss}
              onClick={handleDismissChallenge}
            >
              ✅ {language === 'pt' ? 'Desafio Aceite e Cumprido!' : 'Challenge Accepted!'}
            </button>
          </div>
        </div>
      )}

      {/* Reiniciar Partida no Fim */}
      {status === 'finished' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleResetGame} disabled={submitting}>
            🔄 {language === 'pt' ? 'Jogar Novamente' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
}
