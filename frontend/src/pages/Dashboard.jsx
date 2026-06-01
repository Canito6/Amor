import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [nome, setNome] = useState('');
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
    }
  }, [navigate]);

  const terminarSessao = () => {
    localStorage.clear(); // Limpa o localStorage
    navigate('/'); // Volta para o login
  };

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '800px', paddingTop: '60px' }}>
      <div className="glass-panel" style={{ padding: '40px 20px', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '36px', marginBottom: '8px' }}>
          Bem-vindo(a), {nome}! ❤️
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          O que queres partilhar ou ver hoje no nosso Cantinho?
        </p>
      </div>

      {/* Grid de Navegação dos Cartões */}
      <div className="nav-grid">
        {/* Cartão de Mensagens */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/mensagens')}
        >
          <span className="nav-card-icon">💌</span>
          <h3 className="nav-card-title">Mural de Notas</h3>
          <p className="nav-card-desc">Deixa mensagens de carinho e cartas românticas</p>
        </div>

        {/* Cartão de Fotos */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/fotos')}
        >
          <span className="nav-card-icon">📸</span>
          <h3 className="nav-card-title">Galeria de Fotos</h3>
          <p className="nav-card-desc">Guarda e recorda os nossos momentos felizes</p>
        </div>

        {/* Cartão de Memórias */}
        <div 
          className="glass-panel nav-card"
          onClick={() => navigate('/memorias')}
        >
          <span className="nav-card-icon">⏳</span>
          <h3 className="nav-card-title">As Nossas Memórias</h3>
          <p className="nav-card-desc">A nossa linha do tempo e contadores especiais</p>
        </div>
      </div>

      {/* Widget do Spotify com Playlist Romântica/Chill */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '30px', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          🎵 A Nossa Playlist Especial
        </h3>
        <iframe 
          style={{ borderRadius: '12px', border: 'none' }} 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0" 
          width="100%" 
          height="152" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>

      {/* Área dos botões de rodapé */}
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {roleGuardado === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            👑 Painel de Admin
          </button>
        )}

        <button 
          onClick={terminarSessao}
          className="btn btn-dark"
        >
          Sair / Terminar Sessão 🚪
        </button>
      </div>
    </div>
  );
}