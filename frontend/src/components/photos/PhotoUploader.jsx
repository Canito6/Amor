import React from 'react';

export default function PhotoUploader({
  t,
  activeTab,
  currentAlbum,
  selectedAlbumId,
  setSelectedAlbumId,
  albums,
  caption,
  setCaption,
  uploading,
  selectedFile,
  lidarComFicheiro,
  enviarFoto,
  fileInputRef,
  erro
}) {
  if (activeTab !== 'todas' && !currentAlbum) return null;

  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
        {currentAlbum 
          ? `${t.photos_add_album_prefix} "${currentAlbum === 'sem-album' ? t.photos_album_general_title : currentAlbum.name}" 📸`
          : t.photos_add_general}
      </h2>
      <form onSubmit={enviarFoto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label">{t.photos_input_select}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={lidarComFicheiro}
              required
              className="input-control"
              style={{ padding: '8px 12px' }}
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.photos_input_caption}</label>
            <input
              type="text"
              placeholder={t.photos_caption_placeholder}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-control"
            />
          </div>

          {!currentAlbum && activeTab === 'todas' && (
            <div className="form-group">
              <label className="input-label">{t.photos_input_album}</label>
              <select 
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="input-control"
                style={{ appearance: 'auto' }}
              >
                <option value="sem-album">{t.photos_album_none}</option>
                {albums.map((alb) => (
                  <option key={alb._id} value={alb._id}>{alb.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={uploading || !selectedFile}
            style={{ opacity: uploading || !selectedFile ? 0.7 : 1 }}
          >
            {uploading ? t.photos_sending : t.photos_send_submit}
          </button>
        </div>
      </form>
      {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}
