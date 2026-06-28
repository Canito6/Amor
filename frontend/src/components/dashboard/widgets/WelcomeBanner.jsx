export default function WelcomeBanner({ nome, t }) {
  return (
    <div 
      className="glass-panel welcome-banner-premium" 
      style={{ 
        padding: '40px 30px', 
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 77, 109, 0.15) 0%, rgba(114, 9, 183, 0.05) 100%)',
        border: '1px solid rgba(255, 77, 109, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Decorative background shapes */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        fontSize: '120px',
        opacity: 0.08,
        userSelect: 'none',
        pointerEvents: 'none'
      }}>
        ❤️
      </div>
      
      <h1 style={{ 
        fontFamily: 'var(--font-title)',
        fontWeight: '800',
        color: 'var(--text-main)', 
        fontSize: '32px', 
        marginBottom: '10px',
        lineHeight: '1.2'
      }}>
        {t.welcome}, <span style={{ color: 'var(--primary-color)' }}>{nome}</span>! ✨
      </h1>
      <p style={{ 
        fontFamily: 'var(--font-body)',
        color: 'var(--text-muted)', 
        fontSize: '16px',
        margin: 0,
        fontWeight: '500'
      }}>
        {t.what_to_do}
      </p>
    </div>
  );
}
