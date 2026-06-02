import React from 'react';
import { formatDateShort } from '../../utils/dateFormatter';

export default function PhotoLightbox({
  t,
  selectedPhoto,
  setSelectedPhoto,
  meuNome,
  minhaRole,
  language,
  apagarFoto
}) {
  if (!selectedPhoto) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
      onClick={() => setSelectedPhoto(null)}
    >
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          fontSize: '36px',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: 1
        }}
        onClick={() => setSelectedPhoto(null)}
      >
        &times;
      </button>

      <img 
        src={selectedPhoto.url} 
        alt={selectedPhoto.caption}
        style={{
          maxWidth: '90%',
          maxHeight: '75vh',
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <div 
        style={{
          marginTop: '20px',
          color: 'white',
          textAlign: 'center',
          maxWidth: '600px',
          padding: '10px 20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: 'var(--primary-color)', fontSize: '20px', marginBottom: '8px' }}>
          {selectedPhoto.caption || (language === 'pt' ? 'Sem legenda' : 'No caption')}
        </h3>
        <p style={{ fontSize: '14px', color: '#ccc' }}>
          {t.photos_lightbox_by} <strong>{selectedPhoto.uploadedBy}</strong> {t.photos_lightbox_on} {formatDateShort(selectedPhoto.createdAt, language === 'pt' ? 'pt' : 'en')}
        </p>
        {(selectedPhoto.uploadedBy === meuNome || minhaRole === 'admin') && (
          <button
            className="btn btn-danger"
            onClick={(e) => apagarFoto(e, selectedPhoto._id)}
            style={{ marginTop: '15px', padding: '8px 16px', fontSize: '13px' }}
          >
            {t.photos_lightbox_delete}
          </button>
        )}
      </div>
    </div>
  );
}
