import React from 'react';

export default function SecurityMethodSelector({ value, onChange }) {
  return (
    <div className="form-group">
      <label className="input-label">Segurança de Entrada (2FA)</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left', marginTop: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="securityMethod" 
            value="direct" 
            checked={value === 'direct'} 
            onChange={() => onChange('direct')} 
            style={{ accentColor: 'var(--primary-color)' }}
          />
          Entrada Direta (Sem verificação extra)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="securityMethod" 
            value="email" 
            checked={value === 'email'} 
            onChange={() => onChange('email')} 
            style={{ accentColor: 'var(--primary-color)' }}
          />
          Código por Email (Segurança recomendada)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="securityMethod" 
            value="mobile" 
            checked={value === 'mobile'} 
            onChange={() => onChange('mobile')} 
            style={{ accentColor: 'var(--primary-color)' }}
          />
          Código por Telemóvel
        </label>
      </div>
    </div>
  );
}
