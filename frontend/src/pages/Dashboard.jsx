import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePreferences, themePresets } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import './Dashboard.css';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const [nextEvent, setNextEvent] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const navigate = useNavigate();
  const roleGuardado = localStorage.getItem('role');

  const { language, layoutStyle, customTabs } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nomeGuardado = localStorage.getItem('nome');

    if (!token) {
      navigate('/');
    } else {
      setNome(nomeGuardado || 'Amor');
      carregarProximoEvento();
    }
  }, [navigate]);

  const carregarProximoEvento = async () => {
    try {
      const events = await apiFetch('/api/events');
      if (events.length > 0) {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        const futuros = events.filter(e => new Date(e.date).setHours(0,0,0,0) >= hoje.getTime());
        if (futuros.length > 0) {
          const ordenados = futuros.sort((a, b) => new Date(a.date) - new Date(b.date));
          const proximo = ordenados[0];
          setNextEvent(proximo);

          const dataEvt = new Date(proximo.date);
          dataEvt.setHours(0,0,0,0);
          const diferencaMs = dataEvt.getTime() - hoje.getTime();
          const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
          setDaysRemaining(dias);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar próximo evento:', err);
    }
  };

  const terminarSessao = () => {
    localStorage.clear();
    navigate('/');
  };

  const formatarDataExtenso = (dataStr) => {
    const dataObj = new Date(dataStr);
    return dataObj.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatarDiasRestantes = (dias) => {
    if (dias === 0) return t.days_remaining_today;
    if (dias === 1) return t.days_remaining_one;
    return t.days_remaining_many.replace('{count}', dias);
  };

  // Cartões de navegação padrão
  const defaultCards = [
    { path: '/mensagens', label: t.messages, icon: '💌', desc: language === 'pt' ? 'Deixa mensagens de carinho e cartas românticas' : 'Leave sweet messages and love letters', preset: 'romance' },
    { path: '/fotos', label: t.photos, icon: '📸', desc: language === 'pt' ? 'Guarda e recorda os nossos momentos felizes' : 'Save and recall our happy moments', preset: 'sunset' },
    { path: '/memorias', label: t.memories, icon: '⏳', desc: language === 'pt' ? 'A nossa linha do tempo e contadores especiais' : 'Our timeline and special counters', preset: 'lavender' },
    { path: '/quizzes', label: t.quizzes, icon: '🎮', desc: language === 'pt' ? 'O quanto me conheces? Jogo de perguntas' : 'How well do you know me? Trivia game', preset: 'mint' },
    { path: '/calendario', label: t.calendar, icon: '📅', desc: language === 'pt' ? 'Marca datas importantes e jantares de casal' : 'Mark important dates and couple dinners', preset: 'ocean' },
  ];

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '850px', paddingTop: '20px' }}>
      {/* Mensagem de Boas-Vindas */}
      <div className="glass-panel" style={{ padding: '30px 20px', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '34px', marginBottom: '8px' }}>
          {t.welcome}, {nome}! ❤️
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {t.what_to_do}
        </p>
      </div>

      {/* Widget de Contagem Decrescente */}
      {nextEvent && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 25px', 
            marginBottom: '30px', 
            border: '2px dashed var(--primary-color)', 
            background: 'rgba(255, 77, 109, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '24px' }}>{t.countdown}</span>
          <h2 style={{ fontSize: '18px', color: 'var(--text-main)', margin: 0 }}>
            {t.next_event}: <strong style={{ color: 'var(--primary-color)' }}>{nextEvent.title}</strong>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {formatarDataExtenso(nextEvent.date)}
          </p>
          <span 
            style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: 'var(--secondary-color)',
              background: 'white',
              padding: '6px 16px',
              borderRadius: '12px',
              marginTop: '5px',
              border: '1px solid rgba(114, 9, 183, 0.15)'
            }}
          >
            {formatarDiasRestantes(daysRemaining)}
          </span>
        </div>
      )}

      {/* LAYOUT DE CARTÕES (Apenas quando layoutStyle === 'stacked') */}
      {layoutStyle === 'stacked' && (
        <div className="stacked-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '30px 0' }}>
          {defaultCards.map(card => (
            <div 
              key={card.path}
              className="glass-panel nav-card-stacked preset-theme-card"
              onClick={() => navigate(card.path)}
              style={{ '--card-accent': themePresets[card.preset].accent }}
            >
              <div className="card-stacked-icon">{card.icon}</div>
              <div className="card-stacked-info">
                <h3>{card.label}</h3>
                <p>{card.desc}</p>
              </div>
              <div className="card-stacked-arrow">➔</div>
            </div>
          ))}

          {/* Abas personalizadas incluídas nos cartões stacked */}
          {customTabs.map(tab => (
            <div 
              key={tab._id}
              className="glass-panel nav-card-stacked custom-theme-card"
              onClick={() => navigate(`/tab/${tab._id}`)}
              style={{ '--card-accent': tab.accentColor }}
            >
              <div className="card-stacked-icon">{tab.icon}</div>
              <div className="card-stacked-info">
                <h3>{tab.title}</h3>
                <p>{tab.contentType === 'notes' ? t.content_notes : (tab.contentType === 'media' ? t.content_media : t.content_link)}</p>
              </div>
              <div className="card-stacked-arrow">➔</div>
            </div>
          ))}
        </div>
      )}

      {/* Widget do Spotify */}
      <div className="glass-panel" style={{ padding: '20px', marginTop: '30px', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {t.playlist}
        </h3>
        <iframe 
          style={{ borderRadius: '12px', border: 'none' }} 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0" 
          width="100%" 
          height="80" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>

      {/* Área dos botões de rodapé */}
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {layoutStyle === 'stacked' && (
          <button 
            onClick={terminarSessao}
            className="btn btn-dark"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            {t.logout}
          </button>
        )}
      </div>
    </div>
  );
}