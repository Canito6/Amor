import { useNavigate } from 'react-router-dom';
import { themePresets } from '../../context/PreferencesContext';

export default function NavigationCards({ layoutStyle, customTabs, t, language }) {
  const navigate = useNavigate();

  // Cartões de navegação padrão
  const defaultCards = [
    { path: '/mensagens', label: t.messages, icon: '💌', desc: language === 'pt' ? 'Deixa mensagens de carinho e cartas românticas' : 'Leave sweet messages and love letters', preset: 'romance' },
    { path: '/fotos', label: t.photos, icon: '📸', desc: language === 'pt' ? 'Guarda e recorda os nossos momentos felizes' : 'Save and recall our happy moments', preset: 'sunset' },
    { path: '/memorias', label: t.memories, icon: '⏳', desc: language === 'pt' ? 'A nossa linha do tempo e contadores especiais' : 'Our timeline and special counters', preset: 'lavender' },
    { path: '/quizzes', label: t.quizzes, icon: '🎮', desc: language === 'pt' ? 'O quanto me conheces? Jogo de perguntas' : 'How well do you know me? Trivia game', preset: 'mint' },
    { path: '/calendario', label: t.calendar, icon: '📅', desc: language === 'pt' ? 'Marca datas importantes e jantares de casal' : 'Mark important dates and couple dinners', preset: 'ocean' },
  ];

  if (layoutStyle !== 'stacked') return null;

  return (
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
  );
}
