

export default function BucketCompletionModal({
  completingItem,
  completionFile,
  uploading,
  onSubmit,
  onClose,
  fileInputRef,
  handleFileChange,
  language,
  t
}) {
  if (!completingItem) return null;

  return (
    <div className="bucket-modal-backdrop fade-in">
      <div className="glass-panel bucket-completion-modal">
        <div className="modal-header">
          <h3>🏆 {t.bucket_complete_action || 'Cumprir Desejo'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <p className="completion-instruction">
          {language === 'pt' 
            ? `Estão prestes a riscar "${completingItem.title}" da vossa lista! Querem guardar uma foto desse momento?`
            : `You are about to cross "${completingItem.title}" off your list! Want to save a memory photo?`}
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="input-label">{t.bucket_upload_photo || 'Foto de recordação (Opcional)'}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input-hidden"
              id="completionPhoto"
              style={{ display: 'none' }}
            />
            <div className="custom-file-upload-row">
              <label htmlFor="completionPhoto" className="btn btn-dark btn-select-file">
                📸 {language === 'pt' ? 'Selecionar Imagem' : 'Choose Image'}
              </label>
              {completionFile && (
                <span className="selected-filename-tag">
                  {completionFile.name.substring(0, 20)}...
                </span>
              )}
            </div>
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? '...' : (t.bucket_complete_btn || 'Concluir!')}
            </button>
            <button 
              type="button" 
              className="btn btn-dark" 
              onClick={onClose}
            >
              {t.cancel || 'Cancelar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
