import React from 'react';

export default function WelcomeBanner({ nome, relationshipDate, language, t }) {
  const daysTogether = relationshipDate
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(relationshipDate).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div 
      className="welcome-banner-premium" 
      style={{ 
        padding: '35px 30px', 
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15) 0%, rgba(197, 137, 232, 0.1) 100%)',
        border: '1px solid rgba(255, 107, 157, 0.15)',
        borderRadius: 'var(--radius-lg, 24px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Premium background SVG illustration of intersecting hearts & stars */}
      <svg 
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '160px',
          height: '160px',
          opacity: 0.18,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <path 
          d="M12 21.35C16.8 17.6 22.8 15 28.8 18.2C36.8 22.4 39.2 32.8 33.6 39.6L12 62L-9.6 39.6C-15.2 32.8 -12.8 22.4 -4.8 18.2C1.2 15 7.2 17.6 12 21.35Z" 
          fill="url(#heartGrad)" 
          transform="translate(50, 20) scale(0.9)"
        />
        <circle cx="25" cy="80" r="3" fill="#C589E8" />
        <circle cx="85" cy="30" r="4" fill="#FF6B9D" />
        <path d="M75 75L77 70L79 75L84 77L79 79L77 84L75 79L70 77L75 75Z" fill="#FF6B9D" />
        <path d="M20 20L21.5 16.5L23 20L26.5 21.5L23 23L21.5 26.5L20 23L16.5 21.5L20 20Z" fill="#C589E8" />
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#C589E8" />
          </linearGradient>
        </defs>
      </svg>
      
      <h1 style={{ 
        fontFamily: 'var(--font-title)',
        fontWeight: '800',
        color: 'var(--text-main)', 
        fontSize: '28px', 
        marginBottom: '10px',
        lineHeight: '1.2'
      }}>
        {t.welcome}, <span style={{ background: 'var(--main-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>{nome}</span>! ✨
      </h1>
      
      {daysTogether !== null ? (
        <p style={{ 
          fontFamily: 'var(--font-body)',
          color: 'var(--text-main)', 
          fontSize: '15px',
          margin: '0 0 5px 0',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          💖 {language === 'pt' 
            ? `Hoje celebramos o vosso ${daysTogether}º dia juntos!` 
            : `Today marks your ${daysTogether}th day together!`}
        </p>
      ) : null}

      <p style={{ 
        fontFamily: 'var(--font-body)',
        color: 'var(--text-muted)', 
        fontSize: '14px',
        margin: 0,
        fontWeight: '500'
      }}>
        {t.what_to_do}
      </p>
    </div>
  );
}

