

export default function LightboxImageArea({
  url,
  caption,
  showArrows,
  onPrev,
  onNext
}) {
  return (
    <>
      {showArrows && (
        <>
          <button
            className="lightbox-arrow-btn arrow-left"
            onClick={onPrev}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className="lightbox-arrow-btn arrow-right"
            onClick={onNext}
            aria-label="Seguinte"
          >
            ›
          </button>
        </>
      )}

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%',
          maxHeight: '70vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={url} 
          alt={caption}
          style={{
            maxWidth: '90%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>
    </>
  );
}
