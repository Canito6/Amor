import React from 'react';

export default function Header({
  nome,
  coupleInfo,
  layoutStyle,
  isMobile,
  onOpenLinkModal,
  onOpenSettings,
  onLogoClick,
  t
}) {
  return (
    <header className="global-topbar glass-panel">
      <div className="topbar-container">
        <div className="topbar-names" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <span>💑</span> {nome} ❤️
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
