

export default function BucketCreator({
  showCreator,
  newTitle,
  setNewTitle,
  newDescription,
  setNewDescription,
  creating,
  onSubmit,
  onClose,
  t
}) {
  if (!showCreator) return null;

  return (
    <div className="bucket-modal-backdrop fade-in">
      <div className="glass-panel bucket-creator-modal">
        <div className="modal-header">
          <h3>📝 {t.bucket_create_title || 'Adicionar Novo Desejo'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="goalTitle">{t.bucket_input_title || 'Título'}</label>
            <input
              id="goalTitle"
              type="text"
              placeholder="Ex: Viagem de balão de ar quente"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-control"
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="goalDesc">{t.bucket_input_desc || 'Notas'}</label>
            <textarea
              id="goalDesc"
              placeholder="Ex: Fazer isto no aniversário de namoro.."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input-control textarea-control"
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '...' : (t.bucket_btn_create || 'Adicionar')}
            </button>
            <button type="button" className="btn btn-dark" onClick={onClose}>
              {t.cancel || 'Cancelar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
