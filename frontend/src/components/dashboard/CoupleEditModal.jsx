import React from 'react';

export default function CoupleEditModal({
  isOpen,
  onClose,
  onSubmit,
  editNames,
  setEditNames,
  editDate,
  setEditDate,
  editSpotify,
  setEditSpotify,
  editError,
  editSuccess,
  t
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel fade-in" 
        style={{ 
          padding: '30px', 
          width: '100%', 
          maxWidth: '480px', 
          textAlign: 'left',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          style={{
            position: 'absolute', top: '15px', right: '15px', 
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'
          }}
          onClick={onClose}
        >
          ✕
        </button>

        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px', textAlign: 'center' }}>
          {t.edit_couple_info || 'Editar Casal'} ❤️
        </h2>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label className="input-label" htmlFor="coupleNames">
              {t.names_label || 'Nome do Casal (ex: Miguel & Maria)'}
            </label>
            <input 
              id="coupleNames"
              type="text"
              placeholder="Ex: Miguel & Maria"
              value={editNames}
              onChange={(e) => setEditNames(e.target.value)}
              className="input-control"
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="relDate">
              {t.relationship_date_label || 'Data de Início do Namoro'}
            </label>
            <input 
              id="relDate"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="input-control"
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="spotifyUrl">
              {t.spotify_playlist_label || 'Link da Playlist Especial do Spotify'}
            </label>
            <input 
              id="spotifyUrl"
              type="text"
              placeholder="Ex: https://open.spotify.com/playlist/..."
              value={editSpotify}
              onChange={(e) => setEditSpotify(e.target.value)}
              className="input-control"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {t.save || 'Guardar'}
            </button>
            <button 
              type="button" 
              className="btn btn-dark" 
              style={{ flex: 1 }}
              onClick={onClose}
            >
              {t.cancel || 'Cancelar'}
            </button>
          </div>
        </form>

        {editError && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{editError}</p>
          </div>
        )}

        {editSuccess && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
            <p style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{editSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}
