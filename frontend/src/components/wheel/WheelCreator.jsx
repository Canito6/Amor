

export default function WheelCreator({
  newTitle,
  setNewTitle,
  newOptions,
  creating,
  onSubmit,
  onClose,
  t,
  onAddOptionField,
  onRemoveOptionField,
  onOptionChange
}) {
  return (
    <div className="glass-panel wheel-creator-form fade-in">
      <div className="creator-form-header">
        <h3>🎡 {t.wheel_create_title}</h3>
        <button className="close-creator-btn" onClick={onClose}>✕</button>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="input-label" htmlFor="wheelTitle">{t.wheel_input_title}</label>
          <input
            id="wheelTitle"
            type="text"
            placeholder="Ex: Onde vamos jantar?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-control"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group" style={{ alignItems: 'stretch' }}>
          <label className="input-label">{t.wheel_input_options}</label>
          <div className="options-fields-list">
            {newOptions.map((opt, index) => (
              <div key={index} className="option-field-row">
                <input
                  type="text"
                  placeholder={`Opção #${index + 1}`}
                  value={opt}
                  onChange={(e) => onOptionChange(index, e.target.value)}
                  className="input-control"
                  required
                  maxLength={50}
                />
                {newOptions.length > 2 && (
                  <button
                    type="button"
                    className="remove-option-btn"
                    onClick={() => onRemoveOptionField(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-dark btn-add-option" onClick={onAddOptionField}>
            {t.wheel_option_add || 'Adicionar Opção'}
          </button>
        </div>

        <div className="form-buttons-row">
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? '...' : (t.wheel_btn_create || 'Criar')}
          </button>
          <button type="button" className="btn btn-dark" onClick={onClose}>
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
