import React from 'react';
import Skeleton from '../shared/Skeleton';

export default function PhotoGrid({
  t,
  loadingPhotos,
  photos,
  currentAlbum,
  setCurrentAlbum,
  meuNome,
  minhaRole,
  language,
  apagarFoto,
  setSelectedPhoto,
  currentPage,
  totalPages,
  loadingMore,
  carregarFotos
}) {
  return (
    <div className="photo-view-section">
      {currentAlbum && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setCurrentAlbum(null)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {t.photos_back_albums}
          </button>
          <h2 style={{ margin: 0, fontSize: '22px' }}>
            {t.photos_tab_folders.replace('📁 ', '')}: <span style={{ color: 'var(--primary-color)' }}>{currentAlbum === 'sem-album' ? t.photos_album_general_title : currentAlbum.name}</span>
          </h2>
        </div>
      )}

      {loadingPhotos ? (
        <div className="photo-grid">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" height="220px" style={{ borderRadius: '16px', marginBottom: 0 }} />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
            {t.photos_empty_album}
          </p>
        </div>
      ) : (
        <>
          <div className="photo-grid">
            {photos.map((photo) => {
              const podeApagar = photo.uploadedBy === meuNome || minhaRole === 'admin';
              return (
                <div 
                  key={photo._id} 
                  className="photo-card"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.url} alt={photo.caption} className="photo-img" loading="lazy" />
                  <div className="photo-overlay">
                    <p className="photo-caption">{photo.caption || (language === 'pt' ? 'Sem legenda' : 'No caption')}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="photo-meta">{t.photos_lightbox_by}: {photo.uploadedBy}</span>
                      {podeApagar && (
                        <button
                          className="btn btn-danger"
                          onClick={(e) => apagarFoto(e, photo._id)}
                          style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                          title={t.delete}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Carregar Mais */}
          {currentPage < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                className="btn btn-dark"
                onClick={() => carregarFotos(currentPage + 1, true)}
                disabled={loadingMore}
                style={{ padding: '12px 28px', fontSize: '15px', opacity: loadingMore ? 0.7 : 1 }}
              >
                {loadingMore ? '⏳ A carregar...' : t.photos_load_more}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
