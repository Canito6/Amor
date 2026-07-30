import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { translations } from '../../../services/common/translations';
import { quizService } from '../../../services/fun/quizService';
import { likelyService } from '../../../services/fun/likelyService';
import { gameScoreService } from '../../../services/fun/gameScoreService';
import GameHubCard from '../../../components/jogos/GameHubCard';
import styles from './Jogos.module.css';

export default function Jogos() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const { showToast } = useToast();
  const t = translations[language];

  // Separador ativo
  const [activeTab, setActiveTab] = useState('all');

  // Filtro de Período de Pontuação ('all' | 'month')
  const [scorePeriod, setScorePeriod] = useState('all');

  // Pontuação do casal
  const [scoreSummary, setScoreSummary] = useState({
    totalCouplePoints: 0,
    byUser: {},
    byGame: {}
  });

  // Contadores reais de jogos
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [likelyCount, setLikelyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchScoreSummary = useCallback(async (period) => {
    try {
      const data = await gameScoreService.getSummary(period);
      if (data) {
        setScoreSummary(data);
      }
    } catch (err) {
      console.error('Erro ao carregar pontuações:', err);
    }
  }, []);

  useEffect(() => {
    fetchScoreSummary(scorePeriod);
  }, [scorePeriod, fetchScoreSummary]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const meuNome = localStorage.getItem('nome') || '';

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          quizzesData,
          likelyQuestionsData
        ] = await Promise.all([
          quizService.getQuizzes().catch(() => []),
          likelyService.getLikelyQuestions().catch(() => [])
        ]);

        // 1. Quizzes pendentes
        const pendingQuizzes = quizzesData.filter(q => q.createdBy !== meuNome && !q.completed).length;
        setQuizzesCount(pendingQuizzes);

        // 2. Perguntas Quem é Mais Provável pendentes
        const pendingLikely = likelyQuestionsData.filter(q => q.votes.length < 2 && !q.votes.some(v => v.voter === meuNome)).length;
        setLikelyCount(pendingLikely);

      } catch (err) {
        console.error('Erro ao carregar dados de jogos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleResetScores = async () => {
    const confirmMsg = language === 'pt'
      ? 'Tens a certeza que queres reiniciar os pontos do casal para uma nova temporada?'
      : 'Are you sure you want to reset couple points for a new season?';

    if (window.confirm(confirmMsg)) {
      try {
        await gameScoreService.resetScores();
        showToast(language === 'pt' ? 'Pontos reiniciados com sucesso! 🏆' : 'Points reset successfully!', 'success');
        fetchScoreSummary(scorePeriod);
      } catch (err) {
        showToast(err.message || 'Erro ao reiniciar pontos', 'error');
      }
    }
  };

  const realTimeGames = [
    {
      path: '/jogos/tic-tac-toe',
      title: language === 'pt' ? 'Jogo do Galo (Tempo Real)' : 'Tic-Tac-Toe (Real-time)',
      desc: language === 'pt' ? 'Desafiem-se no clássico Jogo do Galo com turnos e pontos ao vivo.' : 'Challenge each other in classic real-time Tic-Tac-Toe.',
      icon: '❌⭕',
      accentColor: '#ff6b9d',
      count: 0,
      countLabel: language === 'pt' ? 'Ao Vivo!' : 'Live!'
    },
    {
      path: '/jogos/4-em-linha',
      title: language === 'pt' ? '4 em Linha de Casal' : 'Connect 4 (Real-time)',
      desc: language === 'pt' ? 'Joguem o viciante 4 em Linha em tempo real e ganhem +50 pontos!' : 'Play addictive real-time Connect 4 and win +50 points!',
      icon: '🟡🔵',
      accentColor: '#c589e8',
      count: 0,
      countLabel: language === 'pt' ? 'Novo! 🔥' : 'New! 🔥'
    },
    {
      path: '/desenho',
      title: language === 'pt' ? 'Quadro de Desenho' : 'Drawing Board',
      desc: language === 'pt' ? 'Desenhem e rabisquem juntos em tempo real.' : 'Draw and doodle together in real-time.',
      icon: '✍️',
      accentColor: '#FF8EAD',
      count: 0,
      countLabel: ''
    }
  ];

  const affinityGames = [
    {
      path: '/quizzes',
      title: t.games_card_quizzes || 'Quizzes do Amor',
      desc: t.games_card_quizzes_desc || 'Responde a quizzes divertidos sobre o casal.',
      icon: '🎮',
      accentColor: '#2a9d8f',
      count: quizzesCount,
      countLabel: language === 'pt' ? `${quizzesCount} pendente(s)` : `${quizzesCount} pending`
    },
    {
      path: '/likely',
      title: t.games_card_likely || 'Quem é Mais Provável...',
      desc: t.games_card_likely_desc || 'Votem secretamente e descubram a vossa afinidade.',
      icon: '🃏',
      accentColor: '#00bbf9',
      count: likelyCount,
      countLabel: language === 'pt' ? 'Falta votar!' : 'Needs vote!'
    },
    {
      path: '/jogos/memoria',
      title: language === 'pt' ? 'Jogo da Memória' : 'Memory Game',
      desc: language === 'pt' ? 'Encontra os pares com fotos reais do casal e ganha pontos.' : 'Find pairs with real couple photos and score points.',
      icon: '🧠',
      accentColor: '#c589e8',
      count: 0,
      countLabel: language === 'pt' ? 'Fotos do Casal' : 'Couple Photos'
    }
  ];

  const decisionGames = [
    {
      path: '/roleta',
      title: t.games_card_roleta || 'Roleta de Decisões',
      desc: t.games_card_roleta_desc || 'Roda a roleta para decidir qualquer coisa em casal.',
      icon: '🎡',
      accentColor: '#FFB4A2',
      count: 0,
      countLabel: ''
    }
  ];

  const meuNome = localStorage.getItem('nome') || 'Eu';
  const parceiroNome = localStorage.getItem('parceiroNome') || localStorage.getItem('parceiro') || 'Lara';

  const myPoints = scoreSummary.byUser?.[meuNome] || 0;
  const otherUserEntry = Object.entries(scoreSummary.byUser || {}).find(([uname]) => uname !== meuNome);
  const partnerName = otherUserEntry ? otherUserEntry[0] : parceiroNome;
  const partnerPoints = otherUserEntry ? otherUserEntry[1] : (scoreSummary.byUser?.[partnerName] || 0);

  const grandTotal = scoreSummary.totalCouplePoints || (myPoints + partnerPoints);

  return (
    <div className={`app-container fade-in ${styles.gameHubContainer}`}>
      {/* Cabeçalho */}
      <div className={styles.gameHubHeader}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className={styles.gameHubTitle}>{t.games_title || 'Jogos do Amor 🎮'}</h1>
        <div className={styles.headerSpacerRight}></div>
      </div>

      <p className={styles.gameHubSubtitle}>
        {t.games_subtitle || 'Divertem-se e testem a vossa cumplicidade com jogos românticos! 💖'}
      </p>

      {/* Banner de Pontuação do Casal */}
      <div className={styles.pointsBanner}>
        <div className={styles.pointsBannerMain}>
          {/* Total do Casal */}
          <div className={styles.totalPointsCard}>
            <span className={styles.trophyIcon}>🏆</span>
            <div className={styles.totalTextContainer}>
              <span className={styles.pointsLabel}>
                {language === 'pt' ? 'Pontos Totais do Casal' : 'Couple Total Points'}
              </span>
              <span className={styles.totalPointsValue}>{grandTotal} pts</span>
            </div>
          </div>

          <div className={styles.pointsDivider}></div>

          {/* Pontuação Individual de Ambos */}
          <div className={styles.partnersPointsContainer}>
            <div className={styles.userPointPill}>
              <span className={styles.userBadgeIcon}>👤</span>
              <div className={styles.userPillText}>
                <span className={styles.userNameText}>{meuNome}</span>
                <span className={styles.userScoreText}>{myPoints} pts</span>
              </div>
            </div>

            <span className={styles.heartConnector}>❤️</span>

            <div className={styles.userPointPill}>
              <span className={styles.userBadgeIcon}>💖</span>
              <div className={styles.userPillText}>
                <span className={styles.userNameText}>{partnerName}</span>
                <span className={styles.userScoreText}>{partnerPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Banner: Filtro por Período & Botão de Reset */}
        <div className={styles.bannerFooterBar}>
          <div className={styles.periodToggleGroup}>
            <button
              className={`${styles.periodBtn} ${scorePeriod === 'all' ? styles.activePeriodBtn : ''}`}
              onClick={() => setScorePeriod('all')}
            >
              🏆 {language === 'pt' ? 'Sempre' : 'All-time'}
            </button>
            <button
              className={`${styles.periodBtn} ${scorePeriod === 'month' ? styles.activePeriodBtn : ''}`}
              onClick={() => setScorePeriod('month')}
            >
              📅 {language === 'pt' ? 'Este Mês' : 'This Month'}
            </button>
          </div>

          <button className={styles.resetScoresBtn} onClick={handleResetScores}>
            <span>🔄</span> {language === 'pt' ? 'Reiniciar Temporada' : 'Reset Season'}
          </button>
        </div>
      </div>

      {/* Navegação por Separadores (Tabs) */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>🌟</span> {language === 'pt' ? 'Todos' : 'All'}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'realtime' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('realtime')}
        >
          <span>⚡</span> {language === 'pt' ? 'Tempo Real' : 'Real-time'}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'affinity' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('affinity')}
        >
          <span>🧠</span> {language === 'pt' ? 'Afinidade & Desafios' : 'Affinity'}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'decisions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          <span>🎡</span> {language === 'pt' ? 'Sorte & Decisões' : 'Luck & Decisions'}
        </button>
      </div>

      {/* Categoria 1: Jogos em Tempo Real */}
      {(activeTab === 'all' || activeTab === 'realtime') && (
        <section className={styles.gameCategorySection}>
          <h2 className={styles.categoryTitle}>
            <span>⚡</span> {language === 'pt' ? 'Jogos em Tempo Real' : 'Real-time Games'}
          </h2>
          <div className={styles.gameCardsGrid}>
            {realTimeGames.map(game => (
              <GameHubCard
                key={game.path}
                game={game}
                loading={loading}
                language={language}
                onClick={() => navigate(game.path)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categoria 2: Afinidade & Perguntas */}
      {(activeTab === 'all' || activeTab === 'affinity') && (
        <section className={styles.gameCategorySection}>
          <h2 className={styles.categoryTitle}>
            <span>🧠</span> {t.games_cat_affinity || 'Afinidade & Perguntas'}
          </h2>
          <div className={styles.gameCardsGrid}>
            {affinityGames.map(game => (
              <GameHubCard
                key={game.path}
                game={game}
                loading={loading}
                language={language}
                onClick={() => navigate(game.path)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categoria 3: Sorte & Decisões */}
      {(activeTab === 'all' || activeTab === 'decisions') && (
        <section className={styles.gameCategorySection}>
          <h2 className={styles.categoryTitle}>
            <span>🎡</span> {language === 'pt' ? 'Sorte & Decisões' : 'Luck & Decisions'}
          </h2>
          <div className={styles.gameCardsGrid}>
            {decisionGames.map(game => (
              <GameHubCard
                key={game.path}
                game={game}
                loading={loading}
                language={language}
                onClick={() => navigate(game.path)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
