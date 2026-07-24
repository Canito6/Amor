import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import TwoFactorPanel from '../../components/auth/TwoFactorPanel';
import useLoginForm from '../../hooks/auth/useLoginForm';

export default function Login() {
  const navigate = useNavigate();

  // Se já tiver token, vai direto para o Dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const {
    username,
    setUsername,
    password,
    setPassword,
    erro,
    infoMessage,
    requiresVerification,
    verificationCode,
    setVerificationCode,
    trustDevice,
    setTrustDevice,
    emailMasked,
    isResending,
    fazerLogin,
    confirmarCodigo,
    reenviarCodigo,
    voltarParaPassword
  } = useLoginForm(navigate);

  return (
    <div className="auth-container">
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>
      <div className="glass-panel auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>O Nosso Cantinho ❤️</h1>
        </div>
        
        {!requiresVerification ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '15.5px', textAlign: 'center' }}>
              Entra para aceder ao nosso diário privado
            </p>
            
            <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AuthInput
                id="username"
                label="Utilizador"
                type="text"
                placeholder="O teu Nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <AuthInput
                id="password"
                label="Password"
                type="password"
                placeholder="A tua Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '16px', fontWeight: '600' }}
              >
                Entrar no Cantinho 🔒
              </button>
            </form>
          </>
        ) : (
          <TwoFactorPanel
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            trustDevice={trustDevice}
            setTrustDevice={setTrustDevice}
            emailMasked={emailMasked}
            onResendCode={reenviarCodigo}
            isResending={isResending}
            onSubmit={confirmarCodigo}
            onBack={voltarParaPassword}
          />
        )}

        {infoMessage && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
            <p style={{ color: '#234e52', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
              {infoMessage}
            </p>
          </div>
        )}

        {erro && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
              {erro}
            </p>
          </div>
        )}

        {!requiresVerification && (
          <div style={{ marginTop: '30px', borderTop: '1px dashed rgba(0, 0, 0, 0.1)', paddingTop: '20px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
            <span 
              style={{ color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/recuperar')}
            >
              Esqueceste-te da password?
            </span>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Ainda não têm conta?{' '}
              <span 
                style={{ color: 'var(--primary-color)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/registar')}
              >
                Criar conta nova
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
