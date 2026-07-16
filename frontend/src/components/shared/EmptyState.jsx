import React from 'react';

export default function EmptyState({ icon = '❤️', title, description }) {
  return (
    <div 
      className="empty-state-container" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg, 24px)',
        boxShadow: 'var(--shadow-sm)',
        margin: '20px auto',
        maxWidth: '450px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          fontSize: '48px',
          marginBottom: '15px',
          display: 'inline-block'
        }}
      >
        {icon}
      </div>
      <h3 
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: '18px',
          color: 'var(--text-main)',
          margin: '0 0 8px 0',
          fontWeight: '700'
        }}
      >
        {title}
      </h3>
      <p 
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13.5px',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: '1.4'
        }}
      >
        {description}
      </p>
    </div>
  );
}
