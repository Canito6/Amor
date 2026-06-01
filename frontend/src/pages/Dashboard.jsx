import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const [nextEvent, setNextEvent] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const navigate = useNavigate();

  // Vai buscar a "role" (cargo) que guardámos no login para saber se é admin
  const roleGuardado = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nomeGuardado = localStorage.getItem('nome');

    if (!token) {
      navigate('/');
    } else {
      setNome(nomeGuardado);
      carregarProximoEvento();
    }
  }, [navigate]);

  const carregarProximoEvento = async () => {
    try {
      const events = await apiFetch('/api/events');
      if (events.length > 0) {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        // Encontra o próximo evento futuro (ou hoje)
        const futuros = events.filter(e => new Date(e.date).setHours(0,0,0,0) >= hoje.getTime());
        if (futuros.length > 0) {
          // Já vêm ordenados do backend, mas garantimos ordenação
          const ordenados = futuros.sort((a, b) => new Date(a.date) - new Date(b.date));
          const proximo = ordenados[0];
          setNextEvent(proximo);

          // Calcula dias restantes
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
    localStorage.clear(); // Limpa o localStorage
    navigate('/'); // Volta para o login
  };

  const formatarDataExtenso = (dataStr) => {
    const dataObj = new Date(dataStr);
    return dataObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '850px', paddingTop: '40px' }}>
      {/* Mensagem de Boas-Vindas */}
      <div className="glass-panel" style={{ padding: '30px 20px', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '34px', marginBottom: '8px' }}>
          Bem-vindo(a), {nome}! ❤️
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          O que queres partilhar ou ver hoje no nosso Cantinho?
        </p>
      </div>

      {/* Widget de Contagem Decrescente (Próxima Data Importante) */}
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
          <span style={{ fontSize: '24px' }}>⏳ Contagem Decrescente</span>
          <h2 style={{ fontSize: '18px', color: 'var(--text-main)', margin: 0 }}>
            Próximo Evento: <strong style={{ color: 'var(--primary-color)' }}>{nextEvent.title}</strong>
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
            {daysRemaining === 0 ? '🎯 É HOJE!' : (daysRemaining === 1 ? 'Falta 1 dia!' : `Faltam ${daysRemaining} dias!`)}
          </span>
        </div>
      )}

      {/* Grid de Navegação dos Cartões */}
      <div className="nav-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Cartão de Mensagens */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/mensagens')}
          style={{ height: '190px' }}
        >
          <span className="nav-card-icon">💌</span>
          <h3 className="nav-card-title" style={{ fontSize: '18px' }}>Mural de Notas</h3>
          <p className="nav-card-desc" style={{ fontSize: '12.5px' }}>Deixa mensagens de carinho e cartas românticas</p>
        </div>

        {/* Cartão de Fotos */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/fotos')}
          style={{ height: '190px' }}
        >
          <span className="nav-card-icon">📸</span>
          <h3 className="nav-card-title" style={{ fontSize: '18px' }}>Galeria de Fotos</h3>
          <p className="nav-card-desc" style={{ fontSize: '12.5px' }}>Guarda e recorda os nossos momentos felizes</p>
        </div>

        {/* Cartão de Memórias */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/memorias')}
          style={{ height: '190px' }}
        >
          <span className="nav-card-icon">⏳</span>
          <h3 className="nav-card-title" style={{ fontSize: '18px' }}>As Nossas Memórias</h3>
          <p className="nav-card-desc" style={{ fontSize: '12.5px' }}>A nossa linha do tempo e contadores especiais</p>
        </div>

        {/* Cartão de Quizzes */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/quizzes')}
          style={{ height: '190px' }}
        >
          <span className="nav-card-icon">🎮</span>
          <h3 className="nav-card-title" style={{ fontSize: '18px' }}>Quizzes do Amor</h3>
          <p className="nav-card-desc" style={{ fontSize: '12.5px' }}>O quanto me conheces? Jogo de perguntas</p>
        </div>

        {/* Cartão de Calendário */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/calendario')}
          style={{ height: '190px' }}
        >
          <span className="nav-card-icon">📅</span>
          <h3 className="nav-card-title" style={{ fontSize: '18px' }}>Calendário</h3>
          <p className="nav-card-desc" style={{ fontSize: '12.5px' }}>Marca datas importantes e jantares de casal</p>
        </div>
      </div>

      {/* Widget do Spotify com Playlist Romântica/Chill */}
      <div className="glass-panel" style={{ padding: '20px', marginTop: '30px', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          🎵 A Nossa Playlist Especial
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
        {roleGuardado === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            👑 Painel de Admin
          </button>
        )}

        <button 
          onClick={terminarSessao}
          className="btn btn-dark"
          style={{ padding: '10px 20px', fontSize: '14px' }}
        >
          Sair / Terminar Sessão 🚪
        </button>
      </div>
    </div>
  );
}