import React from 'react';

export default function TwoFactorPanel({
  securityMethod,
  mockSMSCode,
  verificationCode,
  setVerificationCode,
  trustDevice,
  setTrustDevice,
  onSubmit,
  onBack
}) {
  return (
    <>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>
        {securityMethod === 'email' 
          ? 'Enviámos um código de verificação para o teu email.' 
          : 'Enviámos um código de verificação para o teu telemóvel.'}
      </p>

      {mockSMSCode && (
        <div style={{ margin: '15px 0', padding: '12px', borderRadius: '12px', background: 'rgba(255, 77, 109, 0.15)', border: '1px solid var(--primary-color)' }}>
          <p style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>
            [TESTE] Código enviado por SMS: <span style={{ fontSize: '18px', letterSpacing: '2px' }}>{mockSMSCode}</span>
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label className="input-label" htmlFor="verificationCode">Código de Acesso (6 Dígitos)</label>
          <input 
            id="verificationCode"
            type="text" 
            maxLength="6"
            placeholder="000000" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            required
            className="input-control"
            style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px', padding: '10px' }}
          />
        </div>

        <div className="form-group" style={{ alignItems: 'flex-start' }}>
          <label className="auth-checkbox-label">
            <input 
              type="checkbox" 
              checked={trustDevice} 
              onChange={(e) => setTrustDevice(e.target.checked)}
            />
            Confiar neste dispositivo (Guardar sessão)
          </label>
        </div>

        <button 
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Verificar Código 🔑
        </button>

        <button 
          type="button" 
          className="btn btn-dark" 
          onClick={onBack}
          style={{ width: '100%', padding: '10px' }}
        >
          Voltar
        </button>
      </form>
    </>
  );
}
