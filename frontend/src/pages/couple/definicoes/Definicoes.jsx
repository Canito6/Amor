import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences, themePresets } from '../../../context/PreferencesContext';
import { useTabs } from '../../../context/TabContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import GeneralSettings, { BackupSettings } from '../../../components/settings/GeneralSettings';
import CreateTabForm from '../../../components/settings/CreateTabForm';
import ManageTabsList from '../../../components/settings/ManageTabsList';
import './Definicoes.css';

export default function Definicoes() {
  const navigate = useNavigate();
  const {
    language,
    changeLanguage,
    globalTheme,
    changeGlobalTheme,
    colorTheme,
    changeColorTheme
  } = usePreferences();

  const {
    customTabs,
    addCustomTab,
    updateCustomTab,
    deleteCustomTab
  } = useTabs();

  const { showToast } = useToast();
  const { confirm: confirmDialog } = useConfirm();
  const t = translations[language];

  // Active settings hub tab ('general' | 'tabs' | 'backup')
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

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
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">⚙️ {t.settings || 'Definições'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="timeline-subtitle" style={{ textAlign: 'center', marginBottom: '25px' }}>
        {language === 'pt' 
          ? 'Personaliza a tua experiência no cantinho, gere abas e faz cópias de segurança.' 
          : 'Customize your experience, manage custom tabs and backup your data.'}
      </p>

      {/* Menu Principal de Categorias (Nav Hub) */}
      <div className="settings-nav-hub">
        <button 
          className={`settings-hub-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span>🛠️</span> {language === 'pt' ? 'Preferências Gerais' : 'General Preferences'}
        </button>

        <button 
          className={`settings-hub-tab ${activeTab === 'tabs' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabs')}
        >
          <span>📂</span> {language === 'pt' ? 'Abas Personalizadas' : 'Custom Tabs'}
        </button>

        <button 
          className={`settings-hub-tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          <span>🔒</span> {language === 'pt' ? 'Cópia de Segurança & Exportação' : 'Backup & Export'}
        </button>
      </div>

      {/* Conteúdo da Categoria Selecionada */}
      <div className="settings-content-card glass-panel pop-in">
        {/* ABA 1: Preferências Gerais */}
        {activeTab === 'general' && (
          <div>
            <h2 className="settings-section-title">
              <span>🛠️</span> {language === 'pt' ? 'Preferências Gerais da Conta' : 'General Account Preferences'}
            </h2>
            <GeneralSettings
              t={t}
              language={language}
              changeLanguage={changeLanguage}
              globalTheme={globalTheme}
              changeGlobalTheme={changeGlobalTheme}
              colorTheme={colorTheme}
              changeColorTheme={changeColorTheme}
              onClose={() => navigate('/dashboard')}
            />
          </div>
        )}

        {/* ABA 2: Gestão de Abas Personalizadas */}
        {activeTab === 'tabs' && (
          <div>
            <h2 className="settings-section-title">
              <span>📂</span> {t.edit_tabs || 'Gestão de Abas Personalizadas'}
            </h2>
            <section className="settings-section">
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

        {/* ABA 3: Cópia de Segurança & Exportação (Sempre a última categoria) */}
        {activeTab === 'backup' && (
          <div>
            <h2 className="settings-section-title">
              <span>🔒</span> {language === 'pt' ? 'Cópia de Segurança e Exportação de Dados' : 'Backup and Data Export'}
            </h2>
            <BackupSettings language={language} />
          </div>
        )}
      </div>
    </div>
  );
}
