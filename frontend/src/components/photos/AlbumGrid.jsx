import React from 'react';

export default function AlbumGrid({
  t,
  loading,
  albums,
  generalPhotoCount,
  setCurrentAlbum,
  meuNome,
  minhaRole,
  apagarAlbum
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t.photos_loading_albums}</p>
      </div>
    );
  }

  return (
    <div className="album-grid">
      {/* Cartão Fixo para Fotos Sem Álbum */}
      <div className="glass-panel album-card" onClick={() => setCurrentAlbum('sem-album')}>
        <span className="album-badge">
          {generalPhotoCount}
        </span>
        <span className="album-icon">📂</span>
        <h3 className="album-name">{t.photos_album_general_title}</h3>
        <p className="album-desc">{t.photos_album_general_desc}</p>
      </div>

      {/* Álbuns Dinâmicos */}
      {albums.map((alb) => {
        const count = alb.photoCount || 0;
        const podeApagar = alb.createdBy === meuNome || minhaRole === 'admin';
        return (
          <div 
            key={alb._id} 
            className="glass-panel album-card" 
            onClick={() => setCurrentAlbum(alb)}
          >
            <span className="album-badge">{count}</span>
            <span className="album-icon">📁</span>
            <h3 className="album-name">{alb.name}</h3>
            <p className="album-desc">{alb.description || t.photos_no_desc}</p>
            {podeApagar && (
              <button
                onClick={(e) => apagarAlbum(e, alb._id)}
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger-color)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={t.delete}
              >
                🗑️
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
