import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import { scratchCardService } from '../../../services/fun/scratchCardService';
import { couponService } from '../../../services/fun/couponService';
import { letterService } from '../../../services/fun/letterService';
import { jarService } from '../../../services/fun/jarService';
import { bucketListService } from '../../../services/fun/bucketListService';
import GameHubCard from '../../../components/jogos/GameHubCard';
import styles from './Mimos.module.css';

export default function Mimos() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const t = translations[language];

  // Contadores reais
  const [scratchCardsCount, setScratchCardsCount] = useState(0);
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

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          scratchCardsData,
          couponsData,
          lettersData,
          jarNotesData,
          bucketData
        ] = await Promise.all([
          scratchCardService.getScratchCards().catch(() => []),
          couponService.getCoupons().catch(() => []),
          letterService.getLetters().catch(() => []),
          jarService.getJarNotes().catch(() => []),
          bucketListService.getBucketItems().catch(() => [])
        ]);

        // 1. Raspadinhas pendentes
        const pendingScratch = scratchCardsData.filter(c => c.createdBy !== meuNome && !c.isScratched).length;
        setScratchCardsCount(pendingScratch);

        // 2. Vales disponíveis
        const pendingCoupons = couponsData.filter(c => c.createdBy !== meuNome && c.status === 'gifted').length;
        setCouponsCount(pendingCoupons);

        // 3. Cartas 'Abrir Quando...' por abrir
        const pendingLetters = lettersData.filter(l => l.createdBy !== meuNome && !l.isOpened).length;
        setLettersCount(pendingLetters);

        // 4. Bilhetes no Frasco dos Mimos
        setJarCount(jarNotesData.length);

        // 5. Desejos pendentes na Bucket List
        const pendingBucket = bucketData.filter(i => !i.completed).length;
        setBucketCount(pendingBucket);

      } catch (err) {
        console.error('Erro ao carregar dados de mimos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const mimosItems = [
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
      path: '/raspadinhas',
      title: t.games_card_raspadinhas || 'Raspadinhas do Amor',
      desc: t.games_card_raspadinhas_desc || 'Oferece ou raspa mimos e surpresas especiais.',
      icon: '🎫',
      accentColor: '#FF6B9D',
      count: scratchCardsCount,
      countLabel: language === 'pt' ? `${scratchCardsCount} por raspar` : `${scratchCardsCount} to scratch`
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
    <div className={`app-container fade-in ${styles.mimosContainer}`}>
      {/* Cabeçalho */}
      <div className={styles.mimosHeader}>
        <button className="btn btn-dark btn-back" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className={styles.mimosTitle}>Mimos & Surpresas 💖</h1>
        <div className={styles.headerSpacerRight}></div>
      </div>

      <p className={styles.mimosSubtitle}>
        {language === 'pt'
          ? 'Ofereçam vales, cartas, raspadinhas e momentos carinhosos em casal! 🎁'
          : 'Offer coupons, letters, scratch cards and sweet surprises! 🎁'}
      </p>

      {/* Grelha de Mimos */}
      <div className={styles.mimosGrid}>
        {mimosItems.map(item => (
          <GameHubCard
            key={item.path}
            game={item}
            loading={loading}
            language={language}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </div>
  );
}
