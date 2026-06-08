import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { useTabs } from '../context/TabContext';
import { translations } from '../services/translations';
import { authService } from '../services/authService';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
import LinkCoupleModal from './LinkCoupleModal';
import Header from './Header';
import './MainLayout.css';
import '../pages/Dashboard.css';

export default function MainLayout() {
  const {
    language,
    changeLanguage,
    layoutStyle,
    changeLayoutStyle,
    globalTheme,
    changeGlobalTheme,
    setActiveTabTheme,
    applyTabSpecificTheme
  } = usePreferences();

  const {
    customTabs,
    addCustomTab,
    updateCustomTab,
    deleteCustomTab
  } = useTabs();

  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  // UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [coupleInfo, setCoupleInfo] = useState({
    coupleId: '',
    names: '',
    partnerNames: [],
    relationshipDate: null,
    spotifyPlaylist: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const roleGuardado = localStorage.getItem('role');

  const loadCoupleInfo = async () => {
    try {
      const info = await authService.getCoupleInfo();
      setCoupleInfo(info);
      if (info.names) {
        setNome(info.names);
      } else if (info.partnerNames && info.partnerNames.length > 0) {
        setNome(info.partnerNames.join(' & '));
      } else {
        setNome(localStorage.getItem('nome') || 'Amor');
      }
    } catch (err) {
      console.error('Erro ao carregar info do casal:', err);
      setNome(localStorage.getItem('nome') || 'Amor');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadCoupleInfo();
    const handleRefresh = () => {
      loadCoupleInfo();
    };
    window.addEventListener('refreshCoupleInfo', handleRefresh);
    return () => {
      window.removeEventListener('refreshCoupleInfo', handleRefresh);
    };
  }, []);

  // Map system routes to presets for automatic theme application
  const routeThemes = {
    '/dashboard': { preset: 'romance' },
    '/mensagens': { preset: 'romance' },
    '/fotos': { preset: 'sunset' },
    '/memorias': { preset: 'lavender' },
    '/quizzes': { preset: 'mint' },
    '/calendario': { preset: 'ocean' },
    '/raspadinhas': { preset: 'romance' }
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
    authService.logout().catch(err => console.error('Erro ao terminar sessão no backend:', err));
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`layout-root layout-${layoutStyle} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      
      {/* Global Topbar Header */}
      <Header
        nome={nome}
        coupleInfo={coupleInfo}
        layoutStyle={layoutStyle}
        isMobile={isMobile}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogoClick={() => navigate('/dashboard')}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        t={t}
        isDashboardPage={location.pathname === '/dashboard'}
      />

      {/* Sidebar Navigation - PC Sidebar Style */}
      {layoutStyle === 'sidebar' && (
        <>
          {isSidebarOpen && (
            <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
          )}
          <Sidebar
            nome={nome}
            roleGuardado={roleGuardado}
            customTabs={customTabs}
            currentPath={location.pathname}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
            t={t}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Content Area */}
      <main className="layout-content-wrapper">
        {(layoutStyle === 'stacked' || isMobile) && location.pathname !== '/dashboard' && (
          <div className="app-container" style={{ paddingBottom: '0', paddingTop: '10px' }}>
            <button 
              className="btn btn-dark" 
              onClick={() => {
                const isGamePath = ['/quizzes', '/raspadinhas', '/roleta', '/likely'].includes(location.pathname);
                navigate(isGamePath ? '/jogos' : '/dashboard');
              }} 
              style={{ marginBottom: '15px' }}
            >
              ⬅ {['/quizzes', '/raspadinhas', '/roleta', '/likely'].includes(location.pathname) ? (language === 'pt' ? 'Jogos' : 'Games') : t.dashboard}
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

      {/* Link Couple Modal */}
      <LinkCoupleModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        coupleInfo={coupleInfo}
        t={t}
      />
    </div>
  );
}
