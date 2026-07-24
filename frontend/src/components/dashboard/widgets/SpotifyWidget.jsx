

export default function SpotifyWidget({ t, playlistUrl }) {
  // Converte automaticamente URL de partilha normal do Spotify para URL Embed
  let embedUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0";
  
  if (playlistUrl && playlistUrl.trim() !== '') {
    const url = playlistUrl.trim();
    if (url.includes('open.spotify.com/') && !url.includes('/embed')) {
      embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    } else {
      embedUrl = url;
    }
  }

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '20px', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid rgba(255, 77, 109, 0.2)' 
      }}
    >
      <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {t.playlist || '🎵 A Nossa Playlist Especial'}
      </h3>
      <iframe 
        style={{ borderRadius: '12px', border: 'none' }} 
        src={embedUrl} 
        width="100%" 
        height="80" 
        allowFullScreen="" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
      ></iframe>
    </div>
  );
}
