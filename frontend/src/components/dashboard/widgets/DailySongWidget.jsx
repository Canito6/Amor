import { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/common/api';

export default function DailySongWidget({ language }) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSong = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/couple/song');
      setSong(data);
    } catch (err) {
      console.error('Erro ao carregar música do dia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSong();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !artist) return;
    try {
      setSubmitting(true);
      const newSong = await apiFetch('/api/couple/song', {
        method: 'POST',
        body: { title, artist, externalUrl }
      });
      setSong(newSong);
      setShowModal(false);
      setTitle('');
      setArtist('');
      setExternalUrl('');
    } catch (err) {
      alert(err.message || 'Erro ao guardar a música.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel daily-song-widget" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎵 {language === 'pt' ? 'A Nossa Música do Dia' : 'Our Song of the Day'}
        </h3>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowModal(true)}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          ✏️ {song ? (language === 'pt' ? 'Mudar' : 'Change') : (language === 'pt' ? 'Definir' : 'Set')}
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : song ? (
        <div style={{ background: 'rgba(255, 107, 157, 0.08)', padding: '12px 16px', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px', color: 'var(--text-main)' }}>
            "{song.title}"
          </p>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            🎤 {song.artist}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--primary-color)', fontStyle: 'italic' }}>
            💖 {language === 'pt' ? 'Escolhida por' : 'Set by'} {song.setBy}
          </p>
          {song.externalUrl && (
            <a 
              href={song.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'bold' }}
            >
              ▶️ {language === 'pt' ? 'Ouvir Música' : 'Listen Now'}
            </a>
          )}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
          {language === 'pt' 
            ? 'Nenhuma música definida hoje. Escolham a vossa música!' 
            : 'No song set for today. Choose your song!'}
        </p>
      )}

      {showModal && (
        <div className="scratch-lightbox-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '380px', padding: '25px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🎵 {language === 'pt' ? 'Definir Música do Dia' : 'Set Song of the Day'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <input 
                type="text" 
                placeholder={language === 'pt' ? 'Nome da Música' : 'Song Title'} 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="input-field"
              />
              <input 
                type="text" 
                placeholder={language === 'pt' ? 'Artista / Banda' : 'Artist / Band'} 
                value={artist} 
                onChange={e => setArtist(e.target.value)} 
                required 
                className="input-field"
              />
              <input 
                type="url" 
                placeholder={language === 'pt' ? 'Link YouTube (opcional)' : 'YouTube Link (optional)'} 
                value={externalUrl} 
                onChange={e => setExternalUrl(e.target.value)} 
                className="input-field"
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? '...' : (language === 'pt' ? 'Guardar' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
