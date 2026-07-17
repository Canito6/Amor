import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ nome, roleGuardado, customTabs, currentPath, onOpenSettings, onLogout, t, isOpen, onClose }) {
  const navigate = useNavigate();

  const [visibleItems, setVisibleItems] = React.useState(() => {
    const saved = localStorage.getItem('sidebar_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return ['/perfil-casal', '/mensagens', '/fotos', '/memorias', '/timeline', '/jogos', '/calendario', '/bucket-list', '/cartas', '/frasco', '/estatisticas'];
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('sidebar_items');
      if (saved) {
        try {
          setVisibleItems(JSON.parse(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('refreshSidebar', handleUpdate);
    return () => window.removeEventListener('refreshSidebar', handleUpdate);
  }, []);

  const defaultNavItems = [
    { path: '/dashboard', label: t.dashboard, icon: '🏠' },
    { path: '/perfil-casal', label: t.profile_title ? t.profile_title.replace(' 💖', '') : 'Perfil Casal', icon: '💖' },
    { path: '/mensagens', label: t.messages, icon: '💌' },
    { path: '/fotos', label: t.photos, icon: '📸' },
    { path: '/memorias', label: t.memories, icon: '⏳' },
    { path: '/timeline', label: t.timeline || 'Linha do Tempo', icon: '📈' },
    { path: '/jogos', label: t.games_title ? t.games_title.replace(' 🎮', '') : 'Jogos', icon: '🎮' },
    { path: '/calendario', label: t.calendar, icon: '📅' },
    { path: '/bucket-list', label: t.bucket_title || 'Bucket List', icon: '📝' },
    { path: '/cartas', label: t.letter_title ? t.letter_title.replace(' ✉️', '').replace("'Abrir Quando...'", 'Abrir Quando') : 'Cartas', icon: '✉️' },
    { path: '/frasco', label: t.jar_title ? t.jar_title.replace(' 🏺', '') : 'Frasco', icon: '🏺' },
    { path: '/estatisticas', label: t.dashboard === 'Dashboard' ? 'Stats' : (t.dashboard === 'Tablero' ? 'Estadísticas' : 'Estatísticas'), icon: '📊' },
  ];

  const filteredNavItems = defaultNavItems;

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    if (onClose) onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    if (onClose) onClose();
  };

  return (
    <aside className={`app-sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar Menu">✕</button>
      
      <div className="sidebar-header">
        <span className="sidebar-logo">💑</span>
        <h2 className="sidebar-title">Cantinho</h2>
        <p className="sidebar-subtitle">{nome} ❤️</p>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-nav-links">
          {filteredNavItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}

          {/* Custom Tabs */}
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

          {roleGuardado === 'admin' && (
            <button
              onClick={() => handleNavClick('/admin')}
              className={`sidebar-nav-item ${currentPath === '/admin' ? 'active' : ''}`}
              style={{ marginTop: '20px', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', paddingTop: '15px' }}
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
