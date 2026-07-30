import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themePresets } from '../../../context/PreferencesContext';

export default function NavigationCards({ customTabs, t, language }) {
  const navigate = useNavigate();

  const [visibleItems, setVisibleItems] = useState(() => {
    const saved = localStorage.getItem('sidebar_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* erro silenciado intencionalmente */ }
    }
    return ['/perfil-casal', '/mensagens', '/fotos', '/memorias', '/jogos', '/mimos', '/calendario', '/bucket-list', '/cartas', '/frasco', '/estatisticas'];
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('sidebar_items');
      if (saved) {
        try {
          setVisibleItems(JSON.parse(saved));
        } catch { /* erro silenciado intencionalmente */ }
      }
    };

    window.addEventListener('refreshSidebar', handleUpdate);
    
    return () => {
      window.removeEventListener('refreshSidebar', handleUpdate);
    };
  }, []);

  // Cartões de navegação padrão
  const defaultCards = [
    { path: '/perfil-casal', label: t.profile_title ? t.profile_title.replace(' 💖', '') : 'Perfil Casal', icon: '💖', desc: language === 'pt' ? 'Vê as estatísticas, dias juntos e edita as vossas fotos de perfil' : 'View statistics, days together, and edit your profile pictures', preset: 'romance' },
    { path: '/mensagens', label: t.messages, icon: '💌', desc: language === 'pt' ? 'Deixa mensagens de carinho e cartas românticas' : 'Leave sweet messages and love letters', preset: 'romance' },
    { path: '/fotos', label: t.photos, icon: '📸', desc: language === 'pt' ? 'Guarda e recorda os nossos momentos felizes' : 'Save and recall our happy moments', preset: 'sunset' },
    { path: '/memorias', label: t.memories, icon: '⏳', desc: language === 'pt' ? 'A nossa linha do tempo e contadores especiais' : 'Our timeline and special counters', preset: 'lavender' },
    { path: '/jogos', label: t.games_title ? t.games_title.replace(' 🎮', '') : (language === 'pt' ? 'Jogos' : 'Games'), icon: '🎮', desc: language === 'pt' ? 'Diverte-te com Jogo do Galo, Quizzes, Memória, Roleta e muito mais!' : 'Have fun with Tic-Tac-Toe, Quizzes, Memory, Roulette, and more!', preset: 'mint' },
    { path: '/mimos', label: 'Mimos & Surpresas', icon: '🎁', desc: language === 'pt' ? 'Oferece vales, cartas, raspadinhas e surpresas carinhosas' : 'Offer coupons, letters, scratch cards and sweet surprises', preset: 'romance' },
    { path: '/calendario', label: t.calendar, icon: '📅', desc: language === 'pt' ? 'Marca datas importantes e jantares de casal' : 'Mark important dates and couple dinners', preset: 'ocean' },
    { path: '/bucket-list', label: t.bucket_title || 'Bucket List', icon: '📝', desc: language === 'pt' ? 'A vossa lista de desejos e metas românticas com fotos' : 'Your bucket list and romantic goals with photos', preset: 'lavender' },
    { path: '/cartas', label: t.letter_title ? t.letter_title.replace(' ✉️', '').replace("'Abrir Quando...'", 'Abrir Quando') : 'Cartas', icon: '✉️', desc: language === 'pt' ? 'Mensagens surpresa para ler em momentos específicos' : 'Surprise messages to read in specific moments', preset: 'romance' },
    { path: '/frasco', label: t.jar_title ? t.jar_title.replace(' 🏺', '') : 'Frasco', icon: '🏺', desc: language === 'pt' ? 'Tira um papelinho aleatório para alegrar o teu dia' : 'Draw a random note to brighten your day', preset: 'sunset' },
    { path: '/estatisticas', label: t.dashboard === 'Dashboard' ? 'Stats' : (t.dashboard === 'Tablero' ? 'Estadísticas' : 'Estatísticas'), icon: '📊', desc: language === 'pt' ? 'Vê as estatísticas de conversa, humores e conquistas da vossa relação' : 'View chat statistics, moods, and achievements of your relationship', preset: 'ocean' },
  ];

  const filteredCards = defaultCards.filter(card => visibleItems.includes(card.path));

  return (
    <div className="stacked-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '30px 0' }}>
      {filteredCards.map(card => (
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
  );
}
