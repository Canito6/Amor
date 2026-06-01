import React from 'react';

export default function AlbumCreator({
  t,
  newAlbumName,
  setNewAlbumName,
  newAlbumDesc,
  setNewAlbumDesc,
  creatingAlbum,
  criarAlbum
}) {
  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '45px' }}>
      <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.photos_create_album_title}</h2>
      <form onSubmit={criarAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label">{t.photos_input_album_name}</label>
            <input
              type="text"
              placeholder={t.photos_album_name_placeholder}
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              required
              className="input-control"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.photos_input_album_desc}</label>
            <input
              type="text"
              placeholder={t.photos_album_desc_placeholder}
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
              className="input-control"
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-secondary" disabled={creatingAlbum}>
            {creatingAlbum ? '...' : t.photos_create_album_submit}
          </button>
        </div>
      </form>
    </div>
  );
}
