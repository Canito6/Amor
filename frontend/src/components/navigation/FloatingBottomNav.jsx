import { useLocation, useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import './FloatingBottomNav.css';

export default function FloatingBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = usePreferences();

  // Não mostrar na página inicial de login/registo
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const navItems = [
    { path: '/dashboard', labelPt: 'Início', labelEn: 'Home', icon: '🏠' },
    { path: '/jogos', labelPt: 'Jogos', labelEn: 'Games', icon: '🎮' },
    { path: '/memorias', labelPt: 'Memórias', labelEn: 'Memories', icon: '📸' },
    { path: '/mensagens', labelPt: 'Conversa', labelEn: 'Chat', icon: '💬' },
    { path: '/perfil-casal', labelPt: 'Perfil', labelEn: 'Profile', icon: '💖' }
  ];

  return (
    <nav className="floating-bottom-nav">
      <div className="floating-nav-container glass-panel">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              className={`floating-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={language === 'pt' ? item.labelPt : item.labelEn}
            >
              <span className="floating-nav-icon">{item.icon}</span>
              <span className="floating-nav-label">
                {language === 'pt' ? item.labelPt : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
