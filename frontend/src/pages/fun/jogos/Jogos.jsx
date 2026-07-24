import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import { quizService } from '../../../services/fun/quizService';
import { scratchCardService } from '../../../services/fun/scratchCardService';
import { likelyService } from '../../../services/fun/likelyService';
import { couponService } from '../../../services/fun/couponService';
import { letterService } from '../../../services/fun/letterService';
import { jarService } from '../../../services/fun/jarService';
import { bucketListService } from '../../../services/fun/bucketListService';
import GameHubCard from '../../../components/jogos/GameHubCard';
import styles from './Jogos.module.css';

export default function Jogos() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const t = translations[language];

  // Contadores reais
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [scratchCardsCount, setScratchCardsCount] = useState(0);
  const [likelyCount, setLikelyCount] = useState(0);
  const [couponsCount, setCouponsCount] = useState(0);
  const [lettersCount, setLettersCount] = useState(0);
  const [jarCount, setJarCount] = useState(0);
  const [bucketCount, setBucketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const meuNome = localStorage.getItem('nome') || '';

    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [
          quizzesData,
          scratchCardsData,
          likelyQuestionsData,
          couponsData,
          lettersData,
          jarNotesData,
          bucketData
        ] = await Promise.all([
          quizService.getQuizzes().catch(() => []),
          scratchCardService.getScratchCards().catch(() => []),
          likelyService.getLikelyQuestions().catch(() => []),
          couponService.getCoupons().catch(() => []),
          letterService.getLetters().catch(() => []),
          jarService.getJarNotes().catch(() => []),
          bucketListService.getBucketItems().catch(() => [])
        ]);

        // 1. Quizzes pendentes por responder (criados pelo parceiro e não completados)
        const pendingQuizzes = quizzesData.filter(q => q.createdBy !== meuNome && !q.completed).length;
        setQuizzesCount(pendingQuizzes);

        // 2. Raspadinhas pendentes (oferecidas pelo parceiro e não raspadas)
        const pendingScratch = scratchCardsData.filter(c => c.createdBy !== meuNome && !c.isScratched).length;
        setScratchCardsCount(pendingScratch);

        // 3. Perguntas Quem é Mais Provável pendentes (menos de 2 votos e sem o meu voto)
        const pendingLikely = likelyQuestionsData.filter(q => q.votes.length < 2 && !q.votes.some(v => v.voter === meuNome)).length;
        setLikelyCount(pendingLikely);

        // 4. Vales disponíveis (oferecidos pelo parceiro e não resgatados)
        const pendingCoupons = couponsData.filter(c => c.createdBy !== meuNome && c.status === 'gifted').length;
        setCouponsCount(pendingCoupons);

        // 5. Cartas 'Abrir Quando...' por abrir (criadas pelo parceiro e não abertas)
        const pendingLetters = lettersData.filter(l => l.createdBy !== meuNome && !l.isOpened).length;
        setLettersCount(pendingLetters);

        // 6. Bilhetes no Frasco dos Mimos
        setJarCount(jarNotesData.length);

        // 7. Desejos pendentes na Bucket List
        const pendingBucket = bucketData.filter(i => !i.completed).length;
        setBucketCount(pendingBucket);

      } catch (err) {
        console.error('Erro ao carregar contadores de jogos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [navigate]);

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
    }
  ];

  const luckGames = [
    {
      path: '/raspadinhas',
      title: t.games_card_raspadinhas || 'Raspadinhas do Amor',
      desc: t.games_card_raspadinhas_desc || 'Oferece ou raspa mimos e surpresas especiais.',
      icon: '🎫',
      accentColor: '#FF6B9D',
      count: scratchCardsCount,
      countLabel: language === 'pt' ? `${scratchCardsCount} por raspar` : `${scratchCardsCount} to scratch`
    },
    {
      path: '/roleta',
      title: t.games_card_roleta || 'Roleta de Decisões',
      desc: t.games_card_roleta_desc || 'Roda a roleta para decidir qualquer coisa em casal.',
      icon: '🎡',
      accentColor: '#FFB4A2',
      count: 0,
      countLabel: ''
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

  const mimosGames = [
    {
      path: '/vales',
      title: t.games_card_vales || 'Vales de Amor',
      desc: t.games_card_vales_desc || 'Oferece ou resgata vales e mimos virtuais especiais.',
      icon: '🎟️',
      accentColor: '#FF6B9D',
      count: couponsCount,
      countLabel: language === 'pt' ? `${couponsCount} disponível(eis)` : `${couponsCount} available`
    },
    {
      path: '/cartas',
      title: t.games_card_cartas || "Cartas 'Abrir Quando...'",
      desc: t.games_card_cartas_desc || 'Escreve cartas fofas para abrir em momentos de necessidade.',
      icon: '✉️',
      accentColor: '#C589E8',
      count: lettersCount,
      countLabel: language === 'pt' ? `${lettersCount} por abrir` : `${lettersCount} to open`
    },
    {
      path: '/frasco',
      title: t.games_card_frasco || 'Frasco dos Mimos',
      desc: t.games_card_frasco_desc || 'Guarda elogios e piadas e tira um bilhete aleatório.',
      icon: '🏺',
      accentColor: '#88D4F7',
      count: jarCount,
      countLabel: language === 'pt' ? `${jarCount} papelinho(s)` : `${jarCount} note(s)`
    },
    {
      path: '/bucket-list',
      title: t.games_card_bucket || 'Lista de Desejos',
      desc: t.games_card_bucket_desc || 'Metas românticas para realizar em casal.',
      icon: '📝',
      accentColor: '#FF6B9D',
      count: bucketCount,
      countLabel: language === 'pt' ? `${bucketCount} pendente(s)` : `${bucketCount} pending`
    },
    {
      path: '/date-night',
      title: 'Date Night 🥂',
      desc: language === 'pt' ? 'Sorteiem planos surpresa combinando desejos e atividades para a vossa noite!' : 'Draw surprise plans combining wishes and activities for your date night!',
      icon: '🥂',
      accentColor: '#FF6B9D',
      count: 0,
      countLabel: ''
    }
  ];

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

      {/* Categoria: Afinidade e Perguntas */}
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

      {/* Categoria: Sorte e Decisões */}
      <section className={styles.gameCategorySection}>
        <h2 className={styles.categoryTitle}>
          <span>🎲</span> {t.games_cat_luck || 'Sorte & Decisões'}
        </h2>
        <div className={styles.gameCardsGrid}>
          {luckGames.map(game => (
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

      {/* Categoria: Mimos & Surpresas */}
      <section className={styles.gameCategorySection}>
        <h2 className={styles.categoryTitle}>
          <span>💖</span> {t.games_cat_mimos || 'Mimos & Surpresas'}
        </h2>
        <div className={styles.gameCardsGrid}>
          {mimosGames.map(game => (
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
    </div>
  );
}
