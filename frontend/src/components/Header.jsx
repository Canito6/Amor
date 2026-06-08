import React from 'react';

export default function Header({
  nome,
  coupleInfo,
  layoutStyle,
  isMobile,
  onOpenLinkModal,
  onOpenSettings,
  onLogoClick,
  onToggleSidebar,
  t,
  isDashboardPage
}) {
  return (
    <header className="global-topbar glass-panel">
      <div className="topbar-container">
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {layoutStyle === 'sidebar' && (
            <button
              className="topbar-menu-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSidebar();
              }}
              aria-label="Toggle Sidebar"
              style={{
                background: 'rgba(255, 77, 109, 0.08)',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '22px',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              ☰
            </button>
          )}
          <div className="topbar-names" onClick={onLogoClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💑</span> {nome} ❤️
          </div>
        </div>
        <div className="topbar-actions">
          {(!coupleInfo.partnerNames || coupleInfo.partnerNames.length <= 1) && (
            <button className="btn-connect" onClick={onOpenLinkModal}>
              🔗 {t.connect_partner_btn || 'Conectar Parceira'}
            </button>
          )}
          {(layoutStyle === 'stacked' || isMobile) && (
            <button className="topbar-settings-btn" onClick={onOpenSettings}>
              ⚙️ {t.settings}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
