import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import TwoFactorPanel from '../../components/auth/TwoFactorPanel';
import useLoginForm from '../../hooks/useLoginForm';

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
    requiresVerification,
    verificationCode,
    setVerificationCode,
    trustDevice,
    setTrustDevice,
    securityMethod,
    mockSMSCode,
    fazerLogin,
    confirmarCodigo,
    voltarParaPassword
  } = useLoginForm(navigate);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '20px' }}>
      <div className="glass-panel auth-card fade-in">
        <h1 style={{ color: 'var(--primary-color)', fontSize: '32px', marginBottom: '10px' }}>O Nosso Cantinho ❤️</h1>
        
        {!requiresVerification ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Entra para aceder ao nosso diário privado</p>
            
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
                style={{ width: '100%', marginTop: '10px' }}
              >
                Entrar no Cantinho 🔒
              </button>
            </form>
          </>
        ) : (
          <TwoFactorPanel
            securityMethod={securityMethod}
            mockSMSCode={mockSMSCode}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            trustDevice={trustDevice}
            setTrustDevice={setTrustDevice}
            onSubmit={confirmarCodigo}
            onBack={voltarParaPassword}
          />
        )}

        {erro && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
          </div>
        )}

        {!requiresVerification && (
          <div style={{ marginTop: '30px', borderTop: '1px dashed rgba(0, 0, 0, 0.1)', paddingTop: '20px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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