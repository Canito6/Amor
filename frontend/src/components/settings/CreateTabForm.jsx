import React from 'react';

export default function CreateTabForm({
  t,
  language,
  handleCreateTab,
  newTabTitle,
  setNewTabTitle,
  newTabIcon,
  setNewTabIcon,
  newTabContentType,
  setNewTabContentType,
  newTabUrl,
  setNewTabUrl,
  newTabPreset,
  setNewTabPreset,
  newTabCustomColor,
  setNewTabCustomColor
}) {
  return (
    <form onSubmit={handleCreateTab} className="create-tab-form">
      <h4>➕ {t.create_tab}</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="input-label">{t.title}</label>
          <input 
            type="text" 
            value={newTabTitle}
            onChange={(e) => setNewTabTitle(e.target.value)}
            placeholder={language === 'pt' ? 'Ex: Viagens' : 'E.g., Trips'}
            className="input-control"
            required
          />
        </div>
        <div className="form-group">
          <label className="input-label">{t.icon}</label>
          <input 
            type="text" 
            value={newTabIcon}
            onChange={(e) => setNewTabIcon(e.target.value)}
            placeholder="❤️"
            className="input-control"
            maxLength="4"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">{t.content_type}</label>
        <select 
          value={newTabContentType}
          onChange={(e) => setNewTabContentType(e.target.value)}
          className="input-control"
        >
          <option value="notes">📝 {t.content_notes}</option>
          <option value="media">🎵 {t.content_media}</option>
          <option value="link">🌐 {t.content_link}</option>
        </select>
      </div>

      {newTabContentType !== 'notes' && (
        <div className="form-group">
          <label className="input-label">{t.content_url}</label>
          <input 
            type="url" 
            value={newTabUrl}
            onChange={(e) => setNewTabUrl(e.target.value)}
            placeholder="https://..."
            className="input-control"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label className="input-label">{t.tab_theme_preset}</label>
        <select 
          value={newTabPreset}
          onChange={(e) => setNewTabPreset(e.target.value)}
          className="input-control"
        >
          <option value="romance">💖 {language === 'pt' ? 'Romance (Rosa)' : 'Romance (Pink)'}</option>
          <option value="sunset">🌅 {language === 'pt' ? 'Sunset (Laranja)' : 'Sunset (Orange)'}</option>
          <option value="lavender">🔮 {language === 'pt' ? 'Lavender (Roxo)' : 'Lavender (Purple)'}</option>
          <option value="mint">🌿 {language === 'pt' ? 'Mint (Verde)' : 'Mint (Green)'}</option>
          <option value="ocean">🌊 {language === 'pt' ? 'Ocean (Azul)' : 'Ocean (Blue)'}</option>
          <option value="custom">🎨 {language === 'pt' ? 'Personalizado...' : 'Custom...'}</option>
        </select>
      </div>

      {newTabPreset === 'custom' && (
        <div className="form-group">
          <label className="input-label">{t.tab_theme}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="color" 
              value={newTabCustomColor}
              onChange={(e) => setNewTabCustomColor(e.target.value)}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{newTabCustomColor}</span>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
        {t.create_tab}
      </button>
    </form>
  );
}
