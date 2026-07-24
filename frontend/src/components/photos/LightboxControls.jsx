

export default function LightboxControls({
  currentIndex,
  totalPhotos,
  isPlaying,
  setIsPlaying,
  onClose
}) {
  return (
    <div 
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10000,
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {currentIndex !== -1 ? currentIndex + 1 : 1} / {totalPhotos}
        </span>
        {totalPhotos > 1 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? 'var(--primary-color, #ff4d6d)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {isPlaying ? '⏸ Pausa' : '▶ Slideshow'}
          </button>
        )}
      </div>

      <button
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          color: '#ffffff',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onClick={onClose}
        title="Fechar"
      >
        ✕
      </button>
    </div>
  );
}
