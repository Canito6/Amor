

export default function JarHistoryList({
  loading,
  notes,
  getCategoryIcon,
  meuNome,
  minhaRole,
  handleDeleteNote,
  currentPage,
  totalPages,
  carregarNotas,
  loadingMore,
  language,
  t
}) {
  if (loading) {
    return (
      <div className="jar-history-container glass-panel fade-in">
        <h3>📜 {language === 'pt' ? 'A carregar papelinhos...' : 'Loading Placed Notes...'}</h3>
        <div className="jar-history-list">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="jar-history-item skeleton" 
              style={{ height: '70px', borderRadius: '16px', border: 'none' }} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="jar-history-container glass-panel fade-in">
      <h3>📜 {language === 'pt' ? 'Papelinhos Colocados' : 'Placed Notes'}</h3>
      <div className="jar-history-list">
        {notes.map(note => (
          <div key={note._id} className="jar-history-item">
            <span className="history-cat-icon">{getCategoryIcon(note.category)}</span>
            <div className="history-text">
              <p className="history-message">"{note.content}"</p>
              <span className="history-meta">
                {language === 'pt' ? 'Por' : 'By'}: {note.createdBy}
              </span>
            </div>
            {(note.createdBy === meuNome || minhaRole === 'admin') && (
              <button 
                className="history-delete-btn"
                onClick={(e) => handleDeleteNote(e, note._id)}
                title={t.jar_confirm_delete}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      {currentPage < totalPages && (
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button
            className="btn btn-dark"
            onClick={() => carregarNotas(currentPage + 1, true)}
            disabled={loadingMore}
            style={{ padding: '10px 24px', fontSize: '14px', opacity: loadingMore ? 0.7 : 1 }}
          >
            {loadingMore ? '⏳ A carregar...' : (language === 'pt' ? 'Carregar Mais' : 'Load More')}
          </button>
        </div>
      )}
    </div>
  );
}
