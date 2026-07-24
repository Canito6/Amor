

export default function NoteUnfolder({
  note,
  onClose,
  getCategoryIcon,
  getCategoryLabel,
  language,
  t
}) {
  return (
    <div className="jar-modal-backdrop fade-in" onClick={onClose}>
      <div className="glass-panel jar-drawn-modal" onClick={e => e.stopPropagation()}>
        <div className="drawn-paper-unfold">
          <div className="paper-unfold-top">
            <span className="drawn-paper-category">
              {getCategoryIcon(note.category)} {getCategoryLabel(note.category)}
            </span>
            <button className="close-paper-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="paper-unfold-body">
            <p className="paper-message-text">"{note.content}"</p>
          </div>
          
          <div className="paper-unfold-footer">
            <span className="paper-author-tag">
              {language === 'pt' ? 'Escrito por' : 'Written by'}: <strong>{note.createdBy}</strong>
            </span>
            <button 
              className="btn btn-dark btn-close-paper"
              onClick={onClose}
            >
              {t.jar_modal_close || 'Guardar de Volta 🏺'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
