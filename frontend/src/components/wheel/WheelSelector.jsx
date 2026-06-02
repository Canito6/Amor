import React from 'react';

export default function WheelSelector({
  wheels,
  selectedWheel,
  onSelectWheel,
  isSpinning,
  onNewClick,
  onDeleteClick,
  meuNome,
  t
}) {
  return (
    <div className="wheel-selection-panel glass-panel fade-in">
      <div className="wheel-selection-controls">
        <select
          value={selectedWheel?._id || ''}
          onChange={(e) => onSelectWheel(wheels.find(w => w._id === e.target.value))}
          className="input-control select-control"
          disabled={isSpinning || wheels.length === 0}
        >
          {wheels.length === 0 ? (
            <option value="">{t.wheel_select_placeholder}</option>
          ) : (
            wheels.map(w => (
              <option key={w._id} value={w._id}>{w.title}</option>
            ))
          )}
        </select>

        <button className="btn btn-primary" onClick={onNewClick} disabled={isSpinning}>
          ➕ Nova Decisão
        </button>

        {selectedWheel && (
          <button
            className="wheel-delete-btn"
            onClick={() => onDeleteClick(selectedWheel._id)}
            disabled={isSpinning || selectedWheel.createdBy !== meuNome}
            title={t.wheel_confirm_delete}
          >
            🗑️
          </button>
        )}
      </div>
      {selectedWheel && (
        <p className="wheel-author-tag">
          {t.wheel_by} <strong>{selectedWheel.createdBy}</strong>
        </p>
      )}
    </div>
  );
}
