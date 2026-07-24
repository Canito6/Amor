
import { formatDateShort } from '../../utils/formatting/dateFormatter';

export default function LightboxMetadata({
  selectedPhoto,
  meuNome,
  minhaRole,
  language,
  apagarFoto,
  t
}) {
  return (
    <div 
      style={{
        marginTop: '25px',
        color: 'white',
        textAlign: 'center',
        maxWidth: '600px',
        padding: '15px 25px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ color: 'var(--primary-color)', fontSize: '19px', fontWeight: '700', marginBottom: '8px' }}>
        {selectedPhoto.caption || (language === 'pt' ? 'Sem legenda' : 'No caption')}
      </h3>
      <p style={{ fontSize: '13.5px', color: '#ccc', margin: 0 }}>
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
  );
}
