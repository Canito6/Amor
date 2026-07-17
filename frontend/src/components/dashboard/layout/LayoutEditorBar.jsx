import React from 'react';
import './LayoutEditor.css';
import './WidgetGrid.css';

export default function LayoutEditorBar({
  language,
  widgets,
  onSave,
  onReset,
  onCancel,
  onToggleVisibility,
  getWidgetFriendlyName,
}) {
  return (
    <div className="layout-editor-bar glass-panel fade-in">
      <h3>🛠️ {language === 'pt' ? 'Personalizar Painel' : 'Customize Dashboard'}</h3>
      <p>
        {language === 'pt'
          ? 'Reorganiza os widgets arrastando-os pelo ícone ⣿, altera os seus tamanhos ou gere a sua visibilidade.'
          : 'Reorder widgets by dragging them using the ⣿ icon, change their sizes or manage visibility.'}
      </p>

      <div className="layout-editor-actions">
        <button className="btn btn-primary" onClick={onSave}>
          ✔️ {language === 'pt' ? 'Concluir edição' : 'Finish editing'}
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
    </div>
  );
}
