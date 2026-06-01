import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ nome, roleGuardado, customTabs, currentPath, onOpenSettings, onLogout, t }) {
  const navigate = useNavigate();

  const defaultNavItems = [
    { path: '/dashboard', label: t.dashboard, icon: '🏠' },
    { path: '/mensagens', label: t.messages, icon: '💌' },
    { path: '/fotos', label: t.photos, icon: '📸' },
    { path: '/memorias', label: t.memories, icon: '⏳' },
    { path: '/quizzes', label: t.quizzes, icon: '🎮' },
    { path: '/calendario', label: t.calendar, icon: '📅' },
  ];

  return (
    <aside className="app-sidebar glass-panel">
      <div className="sidebar-header">
        <span className="sidebar-logo">💑</span>
        <h2 className="sidebar-title">Cantinho</h2>
        <p className="sidebar-subtitle">{nome} ❤️</p>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-nav-links">
          {defaultNavItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
                onClick={() => navigate(tabPath)}
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
              onClick={() => navigate('/admin')}
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
        <button className="sidebar-footer-btn" onClick={onOpenSettings}>
          ⚙️ {t.settings}
        </button>
        <button className="sidebar-footer-btn btn-logout" onClick={onLogout}>
          🚪 {t.logout ? t.logout.replace(' 🚪', '') : 'Sair'}
        </button>
      </div>
    </aside>
  );
}
