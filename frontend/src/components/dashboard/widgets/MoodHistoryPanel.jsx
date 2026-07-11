import React from 'react';

export default function MoodHistoryPanel({ sintonia, meuRegisto, parceiroRegisto, formatarDataHistorial }) {
  return (
    <div className="mood-history-section fade-in" style={{ textAlign: 'left' }}>
      {sintonia > 0 && (
        <div className="mood-sintonia-banner" style={{
          background: 'rgba(255, 77, 109, 0.08)',
          border: '1px solid rgba(255, 77, 109, 0.15)',
          borderRadius: '12px',
          padding: '8px 12px',
          fontSize: '12.5px',
          fontWeight: '600',
          color: 'var(--primary-color)',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          💖 Sintonia Recente: {sintonia}%
        </div>
      )}
      
      <div className="mood-history-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="mood-history-col">
          <h5 style={{ margin: '0 0 10px 0', fontSize: '12.5px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
            Tu
          </h5>
          {meuRegisto?.moodHistory && meuRegisto.moodHistory.length > 0 ? (
            <div className="mood-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {meuRegisto.moodHistory.slice(-5).reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ fontSize: '16px' }}>{h.emoji || '💭'}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatarDataHistorial(h.updatedAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Sem histórico.</p>
          )}
        </div>
        
        <div className="mood-history-col">
          <h5 style={{ margin: '0 0 10px 0', fontSize: '12.5px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
            {parceiroRegisto?.username || 'Amor'}
          </h5>
          {parceiroRegisto?.moodHistory && parceiroRegisto.moodHistory.length > 0 ? (
            <div className="mood-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {parceiroRegisto.moodHistory.slice(-5).reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ fontSize: '16px' }}>{h.emoji || '💭'}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{formatarDataHistorial(h.updatedAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Sem histórico.</p>
          )}
        </div>
      </div>
    </div>
  );
}
