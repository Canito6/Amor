import React, { useState } from 'react';
import { themePresets } from '../context/PreferencesContext';
import './SettingsModal.css';

export default function SettingsModal({
  isOpen,
  onClose,
  t,
  language,
  changeLanguage,
  layoutStyle,
  changeLayoutStyle,
  globalTheme,
  changeGlobalTheme,
  customTabs,
  addCustomTab,
  updateCustomTab,
  deleteCustomTab
}) {
  // Form states for creating a new tab
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabIcon, setNewTabIcon] = useState('❤️');
  const [newTabPreset, setNewTabPreset] = useState('romance');
  const [newTabCustomColor, setNewTabCustomColor] = useState('#ff4d6d');
  const [newTabContentType, setNewTabContentType] = useState('notes');
  const [newTabUrl, setNewTabUrl] = useState('');

  // Form states for editing an existing tab
  const [editingTabId, setEditingTabId] = useState(null);
  const [editTabTitle, setEditTabTitle] = useState('');
  const [editTabIcon, setEditTabIcon] = useState('');
  const [editTabPreset, setEditTabPreset] = useState('romance');
  const [editTabCustomColor, setEditTabCustomColor] = useState('#ff4d6d');
  const [editTabContentType, setEditTabContentType] = useState('notes');
  const [editTabUrl, setEditTabUrl] = useState('');

  if (!isOpen) return null;

  const handleCreateTab = async (e) => {
    e.preventDefault();
    if (!newTabTitle.trim()) return;

    let bgGradientValue = `preset:${newTabPreset}`;
    let accentColorValue = themePresets[newTabPreset]?.accent || '#ff4d6d';

    if (newTabPreset === 'custom') {
      accentColorValue = newTabCustomColor;
      bgGradientValue = 'custom';
    }

    try {
      await addCustomTab({
        title: newTabTitle,
        icon: newTabIcon,
        accentColor: accentColorValue,
        bgGradient: bgGradientValue,
        contentType: newTabContentType,
        content: newTabContentType === 'notes' ? '' : newTabUrl,
        order: customTabs.length
      });

      // Reset form
      setNewTabTitle('');
      setNewTabIcon('❤️');
      setNewTabPreset('romance');
      setNewTabContentType('notes');
      setNewTabUrl('');
      alert(t.new_tab_success);
    } catch (err) {
      alert(language === 'pt' ? 'Erro ao criar aba.' : 'Error creating tab.');
    }
  };

  const handleEditClick = (tab) => {
    setEditingTabId(tab._id);
    setEditTabTitle(tab.title);
    setEditTabIcon(tab.icon);
    
    const isPreset = tab.bgGradient && tab.bgGradient.startsWith('preset:');
    const presetName = isPreset ? tab.bgGradient.split('preset:')[1] : 'custom';
    setEditTabPreset(presetName);
    setEditTabCustomColor(tab.accentColor);
    setEditTabContentType(tab.contentType);
    setEditTabUrl(tab.content);
  };

  const handleUpdateTab = async (e) => {
    e.preventDefault();
    if (!editTabTitle.trim()) return;

    let bgGradientValue = `preset:${editTabPreset}`;
    let accentColorValue = themePresets[editTabPreset]?.accent || '#ff4d6d';

    if (editTabPreset === 'custom') {
      accentColorValue = editTabCustomColor;
      bgGradientValue = 'custom';
    }

    try {
      await updateCustomTab(editingTabId, {
        title: editTabTitle,
        icon: editTabIcon,
        accentColor: accentColorValue,
        bgGradient: bgGradientValue,
        contentType: editTabContentType,
        content: editTabUrl
      });
      setEditingTabId(null);
      alert(t.save_success);
    } catch (err) {
      alert(language === 'pt' ? 'Erro ao atualizar aba.' : 'Error updating tab.');
    }
  };

  const handleDeleteTab = async (id) => {
    if (window.confirm(t.delete_confirm)) {
      try {
        await deleteCustomTab(id);
      } catch (err) {
        alert(language === 'pt' ? 'Erro ao eliminar aba.' : 'Error deleting tab.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal glass-panel modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ {t.settings}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* General Preferences */}
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
          </section>

          {/* Custom Tabs management */}
          <section className="settings-section">
            <h3>📂 {t.edit_tabs}</h3>

            {/* Create Tab form */}
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

            {/* List and edit existing tabs */}
            {customTabs.length > 0 && (
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
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
