import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bucketListService } from '../../../services/fun/bucketListService';
import { dateNightService } from '../../../services/fun/dateNightService';
import { usePreferences } from '../../../context/PreferencesContext';
import PolaroidFrame from '../../../components/shared/PolaroidFrame';
import './DateNight.css';

const DATE_SUGGESTIONS_PT = {
  romantic: [
    "Preparar fondue de chocolate com frutas frescas 🍓",
    "Noite de spa em casa com velas aromáticas e massagem 🕯️",
    "Escrever uma carta de amor para abrir no próximo ano ✉️",
    "Jantar à luz das velas ao som de jazz suave 🕯️🎷"
  ],
  cozy: [
    "Ver um filme clássico dos anos 80 sob uma tenda de lençóis ⛺",
    "Preparar cocktails personalizados um para o outro 🍹",
    "Maratona de jogos de tabuleiro acompanhados de chocolate quente ☕🎲",
    "Cozinhar waffles ou panquecas juntos à noite 🧇"
  ],
  adventure: [
    "Passeio noturno a ver as estrelas com cobertor 🌌",
    "Cozinhar uma receita internacional exótica que nunca testaram antes 🍕",
    "Noite de karaoke no YouTube com as vossas músicas favoritas 🎤",
    "Fazer uma caça ao tesouro com pistas e pequenas surpresas pela casa 🗺️"
  ],
  budget: [
    "Preparar uma tábua de queijos e aperitivos caseiros para conversar 🍷",
    "Jogar um jogo de perguntas com apostas românticas ou massagens 🎲",
    "Montar um álbum de fotografias ou memórias juntos 📸",
    "Assistir ao pôr do sol num local especial 🌅"
  ]
};

const DATE_SUGGESTIONS_EN = {
  romantic: [
    "Prepare chocolate fondue with fresh fruits 🍓",
    "Spa night at home with scented candles and massage 🕯️",
    "Write a love letter to open next year ✉️",
    "Candlelight dinner with soft jazz music 🕯️🎷"
  ],
  cozy: [
    "Watch a classic 80s movie under a blanket fort ⛺",
    "Make custom cocktails for each other 🍹",
    "Board game marathon with hot chocolate ☕🎲",
    "Bake waffles or pancakes together late at night 🧇"
  ],
  adventure: [
    "Stargazing night walk with a cozy blanket 🌌",
    "Cook an exotic international recipe you've never tried 🍕",
    "YouTube karaoke night with your favorite songs 🎤",
    "Set up a treasure hunt with romantic clues around the house 🗺️"
  ],
  budget: [
    "Prepare a homemade cheese and snack board to chat 🍷",
    "Play a Q&A game with romantic bets or massage prizes 🎲",
    "Create a photo album or memory book together 📸",
    "Watch the sunset from a special spot 🌅"
  ]
};

export default function DateNight() {
  const navigate = useNavigate();
  const { language } = usePreferences();

  const [bucketItems, setBucketItems] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [vibe, setVibe] = useState('romantic'); // 'romantic', 'cozy', 'adventure', 'budget'
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const playSparkle = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, time, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.08, 0.15); // E5
      playTone(783.99, now + 0.16, 0.15); // G5
      playTone(1046.50, now + 0.24, 0.25); // C6
    } catch (err) {
      console.warn('Web Audio blocker:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bucketListService.getBucketItems();
      const pending = (data || []).filter(item => !item.completed);
      setBucketItems(pending);
      
      // Draw first selection
      drawDateNight(pending);
    } catch (err) {
      console.error('Erro ao carregar bucket list:', err);
      setError(language === 'pt' ? 'Erro ao carregar a lista de desejos.' : 'Error loading bucket list.');
    } finally {
      setLoading(false);
    }
  };

  // Nota: drawDateNight só é chamada a partir de efeitos e handlers de eventos
  // (nunca diretamente durante o render), por isso o uso de Math.random() aqui é seguro.
  const drawDateNight = (pendingList = bucketItems, selectedVibe = vibe) => {
    // Choose random pending bucket item
    if (pendingList.length > 0) {
      // eslint-disable-next-line react-hooks/purity
      const randomBucket = pendingList[Math.floor(Math.random() * pendingList.length)];
      setSelectedBucket(randomBucket);
    } else {
      setSelectedBucket(null);
    }

    // Choose random activity suggestion based on vibe
    const currentMap = language === 'pt' ? DATE_SUGGESTIONS_PT : DATE_SUGGESTIONS_EN;
    const pool = currentMap[selectedVibe] || currentMap['romantic'];
    // eslint-disable-next-line react-hooks/purity
    const randomSug = pool[Math.floor(Math.random() * pool.length)];
    setSelectedSuggestion(randomSug);
    
    playSparkle();
  };

  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAiDateNight = async () => {
    try {
      setLoadingAi(true);
      const plan = await dateNightService.generateAI(vibe);
      setAiPlan(plan);
      playSparkle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleVibeChange = (newVibe) => {
    setVibe(newVibe);
    drawDateNight(bucketItems, newVibe);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-container fade-in date-night-page">
      <div className="date-night-header">
        <button className="btn btn-dark btn-back" onClick={() => navigate('/jogos')}>
          ⬅ {language === 'pt' ? 'Jogos' : 'Games'}
        </button>
        <h1 style={{ fontFamily: 'var(--font-title)', fontWeight: 'bold' }}>
          Date Night 🥂
        </h1>
        <div style={{ width: '80px' }}></div>
      </div>

      <p className="date-night-subtitle">
        {language === 'pt' 
          ? 'Sorteiem um plano surpresa combinando as vossas metas e ideias divertidas!' 
          : 'Draw a surprise plan combining your goals and fun ideas!'}
      </p>

      {/* Vibe Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { key: 'romantic', labelPt: '💖 Romântico', labelEn: '💖 Romantic' },
          { key: 'cozy', labelPt: '☕ Aconchegante', labelEn: '☕ Cozy' },
          { key: 'adventure', labelPt: '🌌 Aventura', labelEn: '🌌 Adventure' },
          { key: 'budget', labelPt: '🪙 Económico', labelEn: '🪙 Budget' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => handleVibeChange(item.key)}
            className={`btn ${vibe === item.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}
          >
            {language === 'pt' ? item.labelPt : item.labelEn}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={handleGenerateAiDateNight}
          className="btn btn-primary"
          disabled={loadingAi}
          style={{ borderRadius: '25px', padding: '10px 24px', fontSize: '15px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', border: 'none', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}
        >
          {loadingAi ? '✨ A criar encontro mágico...' : 'Criar Encontro Único com IA ✨'}
        </button>
      </div>

      {aiPlan && (
        <div className="glass-panel slide-down" style={{ padding: '1.5rem', marginBottom: '20px', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.05)' }}>
          <h3 style={{ color: '#ec4899', marginBottom: '8px' }}>{aiPlan.title}</h3>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>{aiPlan.description}</p>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            {aiPlan.activity && <div>🎯 <strong>Atividade:</strong> {aiPlan.activity}</div>}
            {aiPlan.atmosphere && <div>🕯️ <strong>Ambiente:</strong> {aiPlan.atmosphere}</div>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '30px', color: 'var(--primary-color)' }}>
          <p>{error}</p>
          <button className="btn" onClick={loadData}>
            {language === 'pt' ? 'Tentar Novamente' : 'Try Again'}
          </button>
        </div>
      ) : (
        <div className="date-night-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
          
          <div className="date-night-combo-card" style={{ maxWidth: '420px', width: '100%' }}>
            <PolaroidFrame
              title={language === 'pt' ? 'O Vosso Encontro Surpresa ✨' : 'Your Surprise Date ✨'}
              date={language === 'pt' ? 'Sorteado hoje' : 'Drawn today'}
              id="date-night-frame"
            >
              <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📌 {language === 'pt' ? 'A Meta do Casal (Lista de Desejos):' : 'Couple Goal (Bucket List):'}
                  </h4>
                  {selectedBucket ? (
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {selectedBucket.title}
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {language === 'pt' ? 'Nenhuma meta pendente! Adicionem itens à vossa Bucket List.' : 'No pending goals! Add items to your Bucket List.'}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px dashed rgba(255, 107, 157, 0.2)', paddingTop: '15px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    💡 {language === 'pt' ? 'Atividade Recomendada:' : 'Recommended Activity:'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {selectedSuggestion}
                  </p>
                </div>
              </div>
            </PolaroidFrame>
          </div>

          <button 
            className="btn" 
            onClick={() => drawDateNight()}
            style={{ 
              background: 'var(--main-gradient)', 
              color: 'white', 
              padding: '12px 30px', 
              borderRadius: '25px', 
              fontSize: '15px', 
              fontWeight: 'bold', 
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            🎲 {language === 'pt' ? 'Surpreende-me / Sortear Outra Vez' : 'Surprise me / Roll Again'}
          </button>
        </div>
      )}
    </div>
  );
}
