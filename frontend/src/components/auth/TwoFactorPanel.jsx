import { useState, useEffect } from 'react';

export default function TwoFactorPanel({
  verificationCode,
  setVerificationCode,
  trustDevice,
  setTrustDevice,
  emailMasked,
  onResendCode,
  isResending,
  onSubmit,
  onBack
}) {
  const [countdown, setCountdown] = useState(300); // 5 minutos (300s)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResend = () => {
    setCountdown(300);
    onResendCode();
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(255, 77, 109, 0.12)',
          color: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          margin: '0 auto 12px auto'
        }}>
          📧
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-color, #2d3748)' }}>
          Verificação por E-mail
        </h2>
        <p style={{ color: 'var(--text-muted, #718096)', fontSize: '14.5px', lineHeight: '1.4', margin: 0 }}>
          Enviámos um código de acesso de 6 dígitos para {emailMasked ? <strong style={{ color: 'var(--text-color)' }}>{emailMasked}</strong> : 'o teu e-mail'}.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label className="input-label" htmlFor="verificationCode" style={{ textAlign: 'center', display: 'block' }}>
            Código de Acesso (6 Dígitos)
          </label>
          <input 
            id="verificationCode"
            type="text" 
            maxLength="6"
            placeholder="000000" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            className="input-control"
            style={{ 
              textAlign: 'center', 
              fontSize: '26px', 
              letterSpacing: '8px', 
              fontWeight: 'bold',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid var(--primary-color, #ff4d6d)',
              boxShadow: '0 4px 12px rgba(255, 77, 109, 0.15)'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>
            {countdown > 0 ? (
              <span>Código expira em: <strong style={{ color: 'var(--primary-color)' }}>{formatTime(countdown)}</strong></span>
            ) : (
              <span style={{ color: 'var(--danger-color, #e53e3e)' }}>Código expirado</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color, #ff4d6d)',
              fontWeight: '600',
              cursor: isResending ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '13px'
            }}
          >
            {isResending ? 'A enviar...' : 'Reenviar código'}
          </button>
        </div>

        <div className="form-group" style={{ alignItems: 'flex-start' }}>
          <label className="auth-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
            <input 
              type="checkbox" 
              checked={trustDevice} 
              onChange={(e) => setTrustDevice(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
            />
            Confiar neste dispositivo (30 dias)
          </label>
        </div>

        <button 
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600' }}
        >
          Confirmar e Entrar 🔒
        </button>

        <button 
          type="button" 
          className="btn btn-dark" 
          onClick={onBack}
          style={{ width: '100%', padding: '10px' }}
        >
          Voltar às credenciais
        </button>
      </form>
    </div>
  );
}
