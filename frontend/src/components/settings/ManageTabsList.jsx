

export default function ManageTabsList({
  t,
  language,
  customTabs,
  editingTabId,
  setEditingTabId,
  handleUpdateTab,
  editTabTitle,
  setEditTabTitle,
  editTabIcon,
  setEditTabIcon,
  editTabContentType,
  setEditTabContentType,
  editTabUrl,
  setEditTabUrl,
  editTabPreset,
  setEditTabPreset,
  editTabCustomColor,
  setEditTabCustomColor,
  handleEditClick,
  handleDeleteTab
}) {
  if (customTabs.length === 0) return null;

  return (
    <div className="existing-tabs-list" style={{ marginTop: '25px' }}>
      <h4>✏️ {t.edit_tabs}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        {customTabs.map(tab => (
          <div key={tab._id} className="tab-manage-item glass-panel" style={{ padding: '12px 15px', borderRadius: '14px' }}>
            {editingTabId === tab._id ? (
              /* Inline Edit Form */
              <form onSubmit={handleUpdateTab} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={editTabTitle}
                    onChange={(e) => setEditTabTitle(e.target.value)}
                    className="input-control"
                    required
                  />
                  <input 
                    type="text" 
                    value={editTabIcon}
                    onChange={(e) => setEditTabIcon(e.target.value)}
                    className="input-control"
                  />
                </div>
                
                <select 
                  value={editTabContentType}
                  onChange={(e) => setEditTabContentType(e.target.value)}
                  className="input-control"
                >
                  <option value="notes">📝 {t.content_notes}</option>
                  <option value="media">🎵 {t.content_media}</option>
                  <option value="link">🌐 {t.content_link}</option>
                </select>

                {editTabContentType !== 'notes' && (
                  <input 
                    type="url" 
                    value={editTabUrl}
                    onChange={(e) => setEditTabUrl(e.target.value)}
                    className="input-control"
                    required
                  />
                )}

                <select 
                  value={editTabPreset}
                  onChange={(e) => setEditTabPreset(e.target.value)}
                  className="input-control"
                >
                  <option value="romance">💖 {language === 'pt' ? 'Romance' : 'Romance'}</option>
                  <option value="sunset">🌅 {language === 'pt' ? 'Sunset' : 'Sunset'}</option>
                  <option value="lavender">🔮 {language === 'pt' ? 'Lavender' : 'Lavender'}</option>
                  <option value="mint">🌿 {language === 'pt' ? 'Mint' : 'Mint'}</option>
                  <option value="ocean">🌊 {language === 'pt' ? 'Ocean' : 'Ocean'}</option>
                  <option value="custom">🎨 {language === 'pt' ? 'Personalizado...' : 'Custom...'}</option>
                </select>

                {editTabPreset === 'custom' && (
                  <input 
                    type="color" 
                    value={editTabCustomColor}
                    onChange={(e) => setEditTabCustomColor(e.target.value)}
                    className="input-control"
                  />
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-dark" onClick={() => setEditingTabId(null)} style={{ padding: '8px 15px', fontSize: '12px' }}>
                    {t.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '12px' }}>
                    {t.save}
                  </button>
                </div>
              </form>
            ) : (
              /* Normal display item */
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                  <div>
                    <strong style={{ fontSize: '14px' }}>{tab.title}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {tab.contentType === 'notes' ? t.content_notes : (tab.contentType === 'media' ? t.content_media : t.content_link)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="btn btn-dark" onClick={() => handleEditClick(tab)} style={{ padding: '6px 12px', fontSize: '11px' }}>
                    ✏️
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteTab(tab._id)} style={{ padding: '6px 12px', fontSize: '11px' }}>
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
