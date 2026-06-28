import React from 'react';

export default function WidgetSlot({
  widget,
  index,
  totalWidgets,
  isEditingLayout,
  language,
  getWidgetFriendlyName,
  onMoveWidget,
  onChangeWidgetSize,
  onToggleVisibility,
  children,
}) {
  return (
    <div
      className={`widget-slot widget-slot-${widget.id} widget-size-${widget.size} ${!widget.visible ? 'widget-hidden-in-editor' : ''}`}
    >
      {isEditingLayout && (
        <div className="widget-editor-overlay">
          <span className="widget-drag-label">
            {getWidgetFriendlyName(widget.id)}
          </span>
          <div className="widget-editor-controls">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveWidget(index, -1)}
              title={language === 'pt' ? 'Mover para cima' : 'Move up'}
              className="edit-ctrl-btn"
            >
              ▲
            </button>
            <button
              type="button"
              disabled={index === totalWidgets - 1}
              onClick={() => onMoveWidget(index, 1)}
              title={language === 'pt' ? 'Mover para baixo' : 'Move down'}
              className="edit-ctrl-btn"
            >
              ▼
            </button>
            <select
              value={widget.size}
              onChange={(e) => onChangeWidgetSize(widget.id, e.target.value)}
              className="edit-size-select"
            >
              <option value="normal">{language === 'pt' ? 'Normal' : 'Normal'}</option>
              <option value="wide">{language === 'pt' ? 'Largo' : 'Wide'}</option>
              <option value="stretched">{language === 'pt' ? 'Expandido' : 'Stretched'}</option>
            </select>
            <button
              type="button"
              onClick={() => onToggleVisibility(widget.id)}
              title={widget.visible
                ? (language === 'pt' ? 'Ocultar' : 'Hide')
                : (language === 'pt' ? 'Mostrar' : 'Show')}
              className={`edit-ctrl-btn btn-visibility-toggle ${!widget.visible ? 'hidden-state' : ''}`}
            >
              {widget.visible ? '👁️' : '🙈'}
            </button>
          </div>
        </div>
      )}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
}
