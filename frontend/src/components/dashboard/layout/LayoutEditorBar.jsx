import React from 'react';
import './LayoutEditor.css';
import './WidgetGrid.css';

const SIDEBAR_OPTIONS = (language) => [
  { path: '/perfil-casal', label: language === 'pt' ? 'Perfil Casal' : 'Couple Profile', icon: '💖' },
  { path: '/mensagens',    label: language === 'pt' ? 'Mural de Notas' : 'Messages',       icon: '💌' },
  { path: '/fotos',        label: language === 'pt' ? 'Galeria de Fotos' : 'Photos',        icon: '📸' },
  { path: '/memorias',     label: language === 'pt' ? 'As Nossas Memórias' : 'Memories',   icon: '⏳' },
  { path: '/jogos',        label: language === 'pt' ? 'Jogos do Amor' : 'Games',            icon: '🎮' },
  { path: '/calendario',   label: language === 'pt' ? 'Calendário' : 'Calendar',            icon: '📅' },
  { path: '/bucket-list',  label: language === 'pt' ? 'Lista de Desejos' : 'Bucket List',   icon: '📝' },
  { path: '/cartas',       label: language === 'pt' ? 'Cartas Abrir Quando' : 'Surprise Letters', icon: '✉️' },
  { path: '/frasco',       label: language === 'pt' ? 'Frasco de Atividades' : 'Activity Jar', icon: '🏺' },
];

export default function LayoutEditorBar({
  language,
  widgets,
  selectedSidebarItems,
  onSave,
  onReset,
  onCancel,
  onToggleVisibility,
  onToggleSidebarItem,
  onAutoRemoveDuplicates,
  getWidgetFriendlyName,
}) {
  return (
    <div className="layout-editor-bar glass-panel fade-in">
      <h3>🛠️ {language === 'pt' ? 'Edição de Layout do Painel' : 'Dashboard Layout Editor'}</h3>
      <p>
        {language === 'pt'
          ? 'Reorganiza widgets usando as setas ▲/▼, altera tamanhos e gere a visibilidade.'
          : 'Reorder widgets using ▲/▼ arrows, change sizes and manage visibility.'}
      </p>

      <div className="layout-editor-actions">
        <button className="btn btn-primary" onClick={onSave}>
          💾 {language === 'pt' ? 'Guardar Layout' : 'Save Layout'}
        </button>
        <button className="btn btn-dark" onClick={onReset}>
          🔄 {language === 'pt' ? 'Repor Predefinições' : 'Reset Defaults'}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {language === 'pt' ? 'Cancelar' : 'Cancel'}
        </button>
      </div>

      {/* Hidden widgets manager */}
      {widgets.some(w => !w.visible) && (
        <div className="hidden-widgets-manager">
          <h4>{language === 'pt' ? 'Widgets Ocultados:' : 'Hidden Widgets:'}</h4>
          <div className="hidden-widgets-list">
            {widgets.filter(w => !w.visible).map(w => (
              <button
                key={w.id}
                className="btn btn-secondary btn-sm show-widget-btn"
                onClick={() => onToggleVisibility(w.id)}
              >
                👁️ {language === 'pt' ? 'Mostrar' : 'Show'} {getWidgetFriendlyName(w.id)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar shortcuts configuration */}
      <div className="sidebar-editor-section">
        <h4>{language === 'pt' ? 'Atalhos do Painel Lateral (Sidebar):' : 'Side Panel (Sidebar) Shortcuts:'}</h4>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onAutoRemoveDuplicates}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title={language === 'pt'
              ? 'Desmarca atalhos cujo widget correspondente esteja ativo no painel'
              : 'Deselect shortcuts whose widgets are active on dashboard'}
          >
            🪄 {language === 'pt' ? 'Remover Duplicados do Painel Lateral' : 'Remove Sidebar Duplicates'}
          </button>
        </div>

        <div className="sidebar-checkboxes-grid">
          {SIDEBAR_OPTIONS(language).map(opt => (
            <label key={opt.path} className="sidebar-opt-label">
              <input
                type="checkbox"
                checked={selectedSidebarItems.includes(opt.path)}
                onChange={() => onToggleSidebarItem(opt.path)}
              />
              <span>{opt.icon} {opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
