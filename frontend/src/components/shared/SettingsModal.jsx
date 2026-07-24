import { useState } from 'react';
import { themePresets } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import GeneralSettings, { BackupSettings } from '../settings/GeneralSettings';
import CreateTabForm from '../settings/CreateTabForm';
import ManageTabsList from '../settings/ManageTabsList';
import './SettingsModal.css';

export default function SettingsModal({
  isOpen,
  onClose,
  t,
  language,
  changeLanguage,
  globalTheme,
  changeGlobalTheme,
  colorTheme,
  changeColorTheme,
  customTabs,
  addCustomTab,
  updateCustomTab,
  deleteCustomTab
}) {
  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();

  // Active settings section tab state ('general' | 'tabs' | 'backup')
  const [activeTab, setActiveTab] = useState('general');

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
      showToast(t.new_tab_success, 'success');
    } catch {
      showToast(language === 'pt' ? 'Erro ao criar aba.' : 'Error creating tab.', 'error');
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
      showToast(t.save_success, 'success');
    } catch {
      showToast(language === 'pt' ? 'Erro ao atualizar aba.' : 'Error updating tab.', 'error');
    }
  };

  const handleDeleteTab = async (id) => {
    const ok = await confirmDialog({
      title: t.delete_confirm || 'Eliminar aba?',
      message: t.delete_confirm || 'Tens a certeza que queres eliminar esta aba?',
      confirmText: t.delete || 'Eliminar',
      cancelText: t.cancel || 'Cancelar',
    });
    if (ok) {
      try {
        await deleteCustomTab(id);
      } catch {
        showToast(language === 'pt' ? 'Erro ao eliminar aba.' : 'Error deleting tab.', 'error');
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

        {/* Navegação por 3 Abas Internas */}
        <div className="settings-tab-nav">
          <button 
            className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            🛠️ {language === 'pt' ? 'Geral' : 'General'}
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'tabs' ? 'active' : ''}`}
            onClick={() => setActiveTab('tabs')}
          >
            📂 {language === 'pt' ? 'Abas' : 'Custom Tabs'}
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            🔒 {language === 'pt' ? 'Cópia & Exportação' : 'Backup'}
          </button>
        </div>

        <div className="modal-body">
          {/* ABA 1: Preferências Gerais */}
          {activeTab === 'general' && (
            <div className="fade-in">
              <GeneralSettings
                t={t}
                language={language}
                changeLanguage={changeLanguage}
                globalTheme={globalTheme}
                changeGlobalTheme={changeGlobalTheme}
                colorTheme={colorTheme}
                changeColorTheme={changeColorTheme}
                onClose={onClose}
              />
            </div>
          )}

          {/* ABA 2: Gestão de Abas Personalizadas */}
          {activeTab === 'tabs' && (
            <div className="fade-in">
              <section className="settings-section">
                <h3>📂 {t.edit_tabs}</h3>

                {/* Formulário de criação de aba */}
                <CreateTabForm
                  t={t}
                  language={language}
                  handleCreateTab={handleCreateTab}
                  newTabTitle={newTabTitle}
                  setNewTabTitle={setNewTabTitle}
                  newTabIcon={newTabIcon}
                  setNewTabIcon={setNewTabIcon}
                  newTabContentType={newTabContentType}
                  setNewTabContentType={setNewTabContentType}
                  newTabUrl={newTabUrl}
                  setNewTabUrl={setNewTabUrl}
                  newTabPreset={newTabPreset}
                  setNewTabPreset={setNewTabPreset}
                  newTabCustomColor={newTabCustomColor}
                  setNewTabCustomColor={setNewTabCustomColor}
                />

                {/* Lista e edição de abas existentes */}
                <ManageTabsList
                  t={t}
                  language={language}
                  customTabs={customTabs}
                  editingTabId={editingTabId}
                  setEditingTabId={setEditingTabId}
                  handleUpdateTab={handleUpdateTab}
                  editTabTitle={editTabTitle}
                  setEditTabTitle={setEditTabTitle}
                  editTabIcon={editTabIcon}
                  setEditTabIcon={setEditTabIcon}
                  editTabContentType={editTabContentType}
                  setEditTabContentType={setEditTabContentType}
                  editTabUrl={editTabUrl}
                  setEditTabUrl={setEditTabUrl}
                  editTabPreset={editTabPreset}
                  setEditTabPreset={setEditTabPreset}
                  editTabCustomColor={editTabCustomColor}
                  setEditTabCustomColor={setEditTabCustomColor}
                  handleEditClick={handleEditClick}
                  handleDeleteTab={handleDeleteTab}
                />
              </section>
            </div>
          )}

          {/* ABA 3: Cópia de Segurança & Exportação (Sempre a última aba) */}
          {activeTab === 'backup' && (
            <div className="fade-in">
              <BackupSettings language={language} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
