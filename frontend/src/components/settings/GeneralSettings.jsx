import React from 'react';

export default function GeneralSettings({
  t,
  language,
  changeLanguage,
  layoutStyle,
  changeLayoutStyle,
  globalTheme,
  changeGlobalTheme,
  colorTheme,
  changeColorTheme
}) {
  return (
    <section className="settings-section">
      <h3>🛠️ {language === 'pt' ? 'Geral' : 'General'}</h3>
      
      {/* Language Selection */}
      <div className="form-group">
        <label className="input-label">{t.language}</label>
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)}
          className="input-control"
        >
          <option value="pt">Português 🇵🇹</option>
          <option value="en">English 🇬🇧</option>
          <option value="es">Español 🇪🇸</option>
        </select>
      </div>

      {/* Layout Style Selection */}
      <div className="form-group">
        <label className="input-label">{t.layout_style}</label>
        <select 
          value={layoutStyle} 
          onChange={(e) => changeLayoutStyle(e.target.value)}
          className="input-control"
        >
          <option value="sidebar">{t.layout_sidebar}</option>
          <option value="stacked">{t.layout_stacked}</option>
        </select>
      </div>

      {/* Global Theme Selection */}
      <div className="form-group">
        <label className="input-label">{t.global_theme}</label>
        <select 
          value={globalTheme} 
          onChange={(e) => changeGlobalTheme(e.target.value)}
          className="input-control"
        >
          <option value="light">☀️ {t.theme_light}</option>
          <option value="dark">🌙 {t.theme_dark}</option>
          <option value="system">💻 {t.theme_system}</option>
        </select>
      </div>

      {/* Global Color Theme Selection */}
      <div className="form-group">
        <label className="input-label">{language === 'pt' ? 'Tema de Cores Global' : 'Global Color Theme'}</label>
        <select 
          value={colorTheme} 
          onChange={(e) => changeColorTheme(e.target.value)}
          className="input-control"
        >
          <option value="dynamic">✨ {language === 'pt' ? 'Dinâmico (por Página)' : 'Dynamic (per Page)'}</option>
          <option value="romance">💖 {language === 'pt' ? 'Romance' : 'Romance'}</option>
          <option value="sunset">🌅 {language === 'pt' ? 'Pôr do Sol' : 'Sunset'}</option>
          <option value="lavender">🔮 {language === 'pt' ? 'Lavanda' : 'Lavender'}</option>
          <option value="mint">🍃 {language === 'pt' ? 'Menta' : 'Mint'}</option>
          <option value="ocean">🌊 {language === 'pt' ? 'Oceano' : 'Ocean'}</option>
          <option value="cotton_candy">🍭 {language === 'pt' ? 'Algodão Doce' : 'Cotton Candy'}</option>
        </select>
      </div>
    </section>
  );
}
