import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function WidgetSlot({
  widget,
  index,
  totalWidgets,
  isEditingLayout,
  language,
  getWidgetFriendlyName,
  onChangeWidgetSize,
  onToggleVisibility,
  children,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isEditingLayout
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-slot widget-slot-${widget.id} widget-size-${widget.size} ${!widget.visible ? 'widget-hidden-in-editor' : ''} ${isDragging ? 'widget-dragging' : ''}`}
    >
      {isEditingLayout && (
        <div className="widget-editor-overlay">
          <div 
            className="widget-drag-handle" 
            {...attributes} 
            {...listeners}
            style={{ 
              cursor: 'grab', 
              padding: '6px', 
              fontSize: '20px', 
              display: 'flex', 
              alignItems: 'center',
              userSelect: 'none',
              touchAction: 'none'
            }}
            title={language === 'pt' ? 'Arrastar para reordenar' : 'Drag to reorder'}
          >
            ⣿
          </div>
          <span className="widget-drag-label">
            {getWidgetFriendlyName(widget.id)}
          </span>
          <div className="widget-editor-controls">
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
