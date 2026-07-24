

export default function SecurityMethodSelector({ value, onChange }) {
  return (
    <div className="form-group">
      <label className="input-label">Segurança de Entrada (2FA)</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
        <label className="auth-radio-label">
          <input 
            type="radio" 
            name="securityMethod" 
            value="direct" 
            checked={value === 'direct'} 
            onChange={() => onChange('direct')} 
          />
          Entrada Direta (Sem verificação extra)
        </label>
        <label className="auth-radio-label">
          <input 
            type="radio" 
            name="securityMethod" 
            value="email" 
            checked={value === 'email'} 
            onChange={() => onChange('email')} 
          />
          Código por Email (Segurança recomendada)
        </label>
        <label className="auth-radio-label">
          <input 
            type="radio" 
            name="securityMethod" 
            value="mobile" 
            checked={value === 'mobile'} 
            onChange={() => onChange('mobile')} 
          />
          Código por Telemóvel
        </label>
      </div>
    </div>
  );
}
