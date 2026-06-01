import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
import '../pages/Dashboard.css';

export default function MainLayout() {
  const {
    language,
    changeLanguage,
    layoutStyle,
    changeLayoutStyle,
    globalTheme,
    changeGlobalTheme,
    customTabs,
    addCustomTab,
    updateCustomTab,
    deleteCustomTab,
    setActiveTabTheme,
    applyTabSpecificTheme
  } = usePreferences();

  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  // UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const roleGuardado = localStorage.getItem('role');

  useEffect(() => {
    const nomeGuardado = localStorage.getItem('nome');
    setNome(nomeGuardado || 'Amor');
  }, []);

  // Map system routes to presets for automatic theme application
  const routeThemes = {
    '/dashboard': { preset: 'romance' },
    '/mensagens': { preset: 'romance' },
    '/fotos': { preset: 'sunset' },
    '/memorias': { preset: 'lavender' },
    '/quizzes': { preset: 'mint' },
    '/calendario': { preset: 'ocean' },
  };

  // Sync tab specific theme on route or custom tab selection change
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/tab/')) {
      const tabId = path.split('/tab/')[1];
      const activeTab = customTabs.find(tab => tab._id === tabId);
      if (activeTab) {
        const themeConfig = activeTab.bgGradient && activeTab.bgGradient.includes('preset:')
          ? { preset: activeTab.bgGradient.split('preset:')[1] }
          : { preset: 'custom', accentColor: activeTab.accentColor, bgGradient: activeTab.bgGradient };
        
        setActiveTabTheme(themeConfig);
        applyTabSpecificTheme(themeConfig);
      }
    } else {
      const themeConfig = routeThemes[path] || null;
      setActiveTabTheme(themeConfig);
      applyTabSpecificTheme(themeConfig);
    }
  }, [location.pathname, customTabs]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`layout-root layout-${layoutStyle}`}>
      {/* Sidebar Navigation - PC Sidebar Style */}
      {layoutStyle === 'sidebar' && (
        <Sidebar
          nome={nome}
          roleGuardado={roleGuardado}
          customTabs={customTabs}
          currentPath={location.pathname}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          t={t}
        />
      )}

      {/* Top Header - PC Stacked Style */}
      {layoutStyle === 'stacked' && (
        <header className="app-topbar glass-panel">
          <div className="topbar-container">
            <div className="topbar-brand" onClick={() => navigate('/dashboard')}>
              <span>💑</span> Cantinho do Amor
            </div>
            <button className="topbar-settings-btn" onClick={() => setIsSettingsOpen(true)}>
              ⚙️
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="layout-content-wrapper">
        {layoutStyle === 'stacked' && location.pathname !== '/dashboard' && (
          <div className="app-container" style={{ paddingBottom: '0', paddingTop: '20px' }}>
            <button className="btn btn-dark" onClick={() => navigate('/dashboard')} style={{ marginBottom: '15px' }}>
              ⬅ {t.dashboard}
            </button>
          </div>
        )}
        <div className="content-outlet">
          <Outlet />
        </div>
      </main>

      {/* Settings Dialog Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        t={t}
        language={language}
        changeLanguage={changeLanguage}
        layoutStyle={layoutStyle}
        changeLayoutStyle={changeLayoutStyle}
        globalTheme={globalTheme}
        changeGlobalTheme={changeGlobalTheme}
        customTabs={customTabs}
        addCustomTab={addCustomTab}
        updateCustomTab={updateCustomTab}
        deleteCustomTab={deleteCustomTab}
      />
    </div>
  );
}
