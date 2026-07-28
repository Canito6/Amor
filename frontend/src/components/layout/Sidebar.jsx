import React from 'react';
import { useNavigate } from 'react-router-dom';
import { prefetchRoute } from '../../routes/AppRoutes';
import './Sidebar.css';

export default function Sidebar({ nome, roleGuardado, customTabs, currentPath, onLogout, t, isOpen, onClose }) {
  const navigate = useNavigate();

  const [, setVisibleItems] = React.useState(() => {
    const saved = localStorage.getItem('sidebar_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* erro silenciado intencionalmente */ }
    }
    return ['/perfil-casal', '/mensagens', '/fotos', '/memorias', '/timeline', '/jogos', '/calendario', '/bucket-list', '/cartas', '/frasco', '/estatisticas'];
  });

  const [cycleHidden, setCycleHidden] = React.useState(() => {
    return localStorage.getItem('cycle_hidden_from_menu') === 'true';
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('sidebar_items');
      if (saved) {
        try {
          setVisibleItems(JSON.parse(saved));
        } catch { /* erro silenciado intencionalmente */ }
      }
      setCycleHidden(localStorage.getItem('cycle_hidden_from_menu') === 'true');
    };
    window.addEventListener('refreshSidebar', handleUpdate);
    return () => window.removeEventListener('refreshSidebar', handleUpdate);
  }, []);

  // Grupos intuitivos de navegação
  const mainGroup = [
    { path: '/dashboard', label: t.dashboard, icon: '🏠' },
    { path: '/perfil-casal', label: t.profile_title ? t.profile_title.replace(' 💖', '') : 'Perfil Casal', icon: '💖' },
    { path: '/mensagens', label: t.messages, icon: '💌' },
    { path: '/definicoes', label: t.settings || 'Definições', icon: '⚙️' },
  ];

  const funGroup = [
    { path: '/jogos', label: t.games_title ? t.games_title.replace(' 🎮', '') : 'Jogos', icon: '🎮' },
    { path: '/bucket-list', label: t.bucket_title || 'Bucket List', icon: '📝' },
    { path: '/cartas', label: t.letter_title ? t.letter_title.replace(' ✉️', '').replace("'Abrir Quando...'", 'Abrir Quando') : 'Cartas', icon: '✉️' },
    { path: '/frasco', label: t.jar_title ? t.jar_title.replace(' 🏺', '') : 'Frasco', icon: '🏺' },
  ];

  const memoryGroup = [
    { path: '/fotos', label: t.photos, icon: '📸' },
    { path: '/memorias', label: t.memories, icon: '⏳' },
    { path: '/timeline', label: t.timeline || 'Linha do Tempo', icon: '📈' },
    { path: '/calendario', label: t.calendar, icon: '📅' },
    { path: '/ciclo', label: 'Ciclo Menstrual', icon: '🌸', hidden: cycleHidden },
    { path: '/estatisticas', label: t.dashboard === 'Dashboard' ? 'Stats' : (t.dashboard === 'Tablero' ? 'Estadísticas' : 'Estatísticas'), icon: '📊' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    if (onClose) onClose();
  };

  const renderNavGroup = (items, categoryTitle) => {
    const visible = items.filter(item => !item.hidden);
    if (visible.length === 0) return null;

    return (
      <div key={categoryTitle}>
        <div className="sidebar-category-title">{categoryTitle}</div>
        {visible.map(item => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={() => prefetchRoute(item.path)}
              onTouchStart={() => prefetchRoute(item.path)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside className={`app-sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <button 
        type="button"
        className="sidebar-close-btn" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onClose) onClose();
        }} 
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onClose) onClose();
        }}
        aria-label="Fechar Menu"
      >
        ✕
      </button>
      
      <div className="sidebar-header">
        <span className="sidebar-logo">💑</span>
        <h2 className="sidebar-title">AMORI</h2>
        <p className="sidebar-subtitle">{nome} ❤️</p>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-nav-links">
          {renderNavGroup(mainGroup, '📌 Principal')}
          {renderNavGroup(funGroup, '🎮 Diversão & Jogos')}
          {renderNavGroup(memoryGroup, '📸 Recordações & Agenda')}

          {/* Abas Personalizadas */}
          {customTabs && customTabs.length > 0 && (
            <div>
              <div className="sidebar-category-title">⭐ Abas Personalizadas</div>
              {customTabs.map(tab => {
                const tabPath = `/tab/${tab._id}`;
                const isActive = currentPath === tabPath;
                return (
                  <button
                    key={tab._id}
                    onClick={() => handleNavClick(tabPath)}
                    className={`sidebar-nav-item custom-tab-item ${isActive ? 'active' : ''}`}
                    style={{ '--tab-accent': tab.accentColor }}
                  >
                    <span className="sidebar-nav-icon">{tab.icon}</span>
                    <span className="sidebar-nav-label">{tab.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {roleGuardado === 'admin' && (
            <button
              onClick={() => handleNavClick('/admin')}
              className={`sidebar-nav-item ${currentPath === '/admin' ? 'active' : ''}`}
              style={{ marginTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', paddingTop: '15px' }}
            >
              <span className="sidebar-nav-icon">👑</span>
              <span className="sidebar-nav-label">{t.admin}</span>
            </button>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn btn-logout" onClick={handleLogoutClick}>
          🚪 {t.logout ? t.logout.replace(' 🚪', '') : 'Sair'}
        </button>
      </div>
    </aside>
  );
}
