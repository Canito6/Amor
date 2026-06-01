import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import { authService } from '../services/authService';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [coupleInfo, setCoupleInfo] = useState({
    coupleId: '',
    names: '',
    partnerNames: [],
    relationshipDate: null,
    spotifyPlaylist: ''
  });
  
  // Link couple form states
  const [inviteTokenInput, setInviteTokenInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const roleGuardado = localStorage.getItem('role');

  const loadCoupleInfo = async () => {
    try {
      const info = await authService.getCoupleInfo();
      setCoupleInfo(info);
      if (info.names) {
        setNome(info.names);
      } else if (info.partnerNames && info.partnerNames.length > 0) {
        // Sort names or show them in order
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
    loadCoupleInfo();
    // Listen for storage changes or profile updates
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

  const handleLinkCouple = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!inviteTokenInput.trim()) {
      setLinkError('Por favor insere o código ou utilizador do parceiro.');
      return;
    }

    try {
      const result = await authService.linkCouple(inviteTokenInput);
      setLinkSuccess('Conectados com sucesso! ❤️');
      setInviteTokenInput('');
      
      // Dispatch a custom event to notify other components (e.g. Dashboard) to reload
      window.dispatchEvent(new Event('refreshCoupleInfo'));
      
      setTimeout(() => {
        setIsLinkModalOpen(false);
        setLinkSuccess('');
      }, 1500);
    } catch (err) {
      setLinkError(err.message || 'Erro ao conectar. Tente novamente.');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const inviteLinkUrl = `${window.location.origin}/registar?invite=${coupleInfo.coupleId}`;

  return (
    <div className={`layout-root layout-${layoutStyle}`}>
      
      {/* Global Topbar containing Couple Names */}
      <header className="global-topbar glass-panel">
        <div className="topbar-container">
          <div className="topbar-names" onClick={() => navigate('/dashboard')}>
            <span>💑</span> {nome} ❤️
          </div>
          <div className="topbar-actions">
            {(!coupleInfo.partnerNames || coupleInfo.partnerNames.length <= 1) && (
              <button className="btn-connect" onClick={() => setIsLinkModalOpen(true)}>
                🔗 {t.connect_partner_btn || 'Conectar Parceira'}
              </button>
            )}
            <button className="topbar-settings-btn" onClick={() => setIsSettingsOpen(true)}>
              ⚙️ {t.settings}
            </button>
          </div>
        </div>
      </header>

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

      {/* Main Content Area */}
      <main className="layout-content-wrapper">
        {layoutStyle === 'stacked' && location.pathname !== '/dashboard' && (
          <div className="app-container" style={{ paddingBottom: '0', paddingTop: '10px' }}>
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

      {/* Link Couple Modal */}
      {isLinkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLinkModalOpen(false)}>
          <div 
            className="glass-panel fade-in" 
            style={{ 
              padding: '30px', 
              width: '100%', 
              maxWidth: '480px', 
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{
                position: 'absolute', top: '15px', right: '15px', 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'
              }}
              onClick={() => setIsLinkModalOpen(false)}
            >
              ✕
            </button>

            <h2 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>
              {t.connect_partner_title || 'Conectar Parceiro(a) ❤️'}
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Vincula o vosso cantinho privado com a tua namorada para poderem partilhar notas, fotografias, quizzes e o calendário!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '25px' }}>
              <div>
                <label className="input-label">{t.your_couple_token || 'O teu código de casal'}</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={coupleInfo.coupleId} 
                    className="input-control" 
                    style={{ fontSize: '13px', background: 'rgba(0,0,0,0.05)', flex: 1 }}
                  />
                  <button 
                    className="btn btn-dark" 
                    style={{ padding: '10px 15px', fontSize: '13px' }}
                    onClick={() => copyToClipboard(coupleInfo.coupleId, 'token')}
                  >
                    {copiedToken ? 'Copiado! ✔' : (t.copy_btn || 'Copiar')}
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">{t.invite_link || 'Link de convite'}</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={inviteLinkUrl} 
                    className="input-control" 
                    style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', flex: 1 }}
                  />
                  <button 
                    className="btn btn-dark" 
                    style={{ padding: '10px 15px', fontSize: '13px' }}
                    onClick={() => copyToClipboard(inviteLinkUrl, 'link')}
                  >
                    {copiedLink ? 'Copiado! ✔' : (t.copy_btn || 'Copiar')}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleLinkCouple} style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '20px', textAlign: 'left' }}>
              <div className="form-group">
                <label className="input-label" htmlFor="partnerToken">
                  {t.enter_partner_token || 'Já tens o código do teu parceiro?'}
                </label>
                <input 
                  id="partnerToken"
                  type="text"
                  placeholder={t.partner_token_placeholder || 'Insere o código ou utilizador...'}
                  value={inviteTokenInput}
                  onChange={(e) => setInviteTokenInput(e.target.value)}
                  className="input-control"
                  style={{ marginTop: '5px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '5px' }}>
                {t.connect_now_btn || 'Conectar Agora 💑'}
              </button>
            </form>

            {linkError && (
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{linkError}</p>
              </div>
            )}

            {linkSuccess && (
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
                <p style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{linkSuccess}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
