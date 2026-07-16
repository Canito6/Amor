import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bucketListService } from '../../../services/fun/bucketListService';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import PolaroidFrame from '../../../components/shared/PolaroidFrame';
import './DateNight.css';

const DATE_SUGGESTIONS_PT = [
  "Preparar fondue de chocolate com frutas frescas 🍓",
  "Noite de spa em casa com velas aromáticas e massagem 🕯️",
  "Ver um filme clássico dos anos 80 sob uma tenda de lençóis ⛺",
  "Fazer cocktails personalizados um para o outro 🍹",
  "Preparar uma tábua de queijos e vinho para conversar 🍷",
  "Escrever uma carta de amor para abrir no próximo ano ✉️",
  "Noite de karaoke no YouTube com as vossas músicas favoritas 🎤",
  "Cozinhar uma receita internacional que nunca testaram antes 🍕",
  "Jogar um jogo de tabuleiro com apostas românticas ou massagens de prémio 🎲"
];

const DATE_SUGGESTIONS_EN = [
  "Prepare chocolate fondue with fresh fruits 🍓",
  "Spa night at home with scented candles and massage 🕯️",
  "Watch a classic 80s movie under a blanket fort ⛺",
  "Make custom cocktails for each other 🍹",
  "Prepare a cheese and wine board to talk 🍷",
  "Write a love letter to open next year ✉️",
  "YouTube karaoke night with your favorite songs 🎤",
  "Cook an international recipe you have never tried before 🍕",
  "Play a board game with romantic bets or massage prizes 🎲"
];

export default function DateNight() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const t = translations[language];

  const [bucketItems, setBucketItems] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const suggestions = language === 'pt' ? DATE_SUGGESTIONS_PT : DATE_SUGGESTIONS_EN;

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

  const drawDateNight = (pendingList = bucketItems) => {
    // Choose random pending bucket item
    if (pendingList.length > 0) {
      const randomBucket = pendingList[Math.floor(Math.random() * pendingList.length)];
      setSelectedBucket(randomBucket);
    } else {
      setSelectedBucket(null);
    }

    // Choose random activity suggestion
    const randomSug = suggestions[Math.floor(Math.random() * suggestions.length)];
    setSelectedSuggestion(randomSug);
    
    playSparkle();
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
