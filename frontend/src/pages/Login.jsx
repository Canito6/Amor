import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  // 2FA Verification States
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [securityMethod, setSecurityMethod] = useState('');
  const [mockSMSCode, setMockSMSCode] = useState('');
  
  const navigate = useNavigate();

  // Se já tiver token, vai direto para o Dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const fazerLogin = async (e) => {
    e.preventDefault(); 
    setErro(''); 

    try {
      const deviceToken = localStorage.getItem('trustedDeviceToken');
      const dados = await authService.login(username, password, deviceToken);

      // Se necessitar de verificação por email ou telemóvel (2FA)
      if (dados.requiresVerification) {
        setRequiresVerification(true);
        setTempUserId(dados.userId);
        setSecurityMethod(dados.method);
        setMockSMSCode(dados.mockCode || '');
        return;
      }

      // Verifica se temos de mandar a pessoa para o ecrã de mudar password
      if (dados.precisaMudarPassword) {
        navigate('/forcar-password', { state: { userId: dados.userId } });
        return; 
      }

      // Se estiver tudo normal:
      localStorage.setItem('token', dados.token);
      localStorage.setItem('nome', dados.username);
      localStorage.setItem('role', dados.role); 
      navigate('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login.');
    }
  };

  const confirmarCodigo = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const dados = await authService.verifyLogin(tempUserId, verificationCode, trustDevice);

      localStorage.setItem('token', dados.token);
      localStorage.setItem('nome', dados.username);
      localStorage.setItem('role', dados.role);

      if (dados.trustedDeviceToken) {
        localStorage.setItem('trustedDeviceToken', dados.trustedDeviceToken);
      }

      navigate('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao verificar código.');
    }
  };

  const voltarParaPassword = () => {
    setRequiresVerification(false);
    setVerificationCode('');
    setMockSMSCode('');
    setErro('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '20px' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '32px', marginBottom: '10px' }}>O Nosso Cantinho ❤️</h1>
        
        {!requiresVerification ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Entra para aceder ao nosso diário privado</p>
            
            <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="input-label" htmlFor="username">Utilizador</label>
                <input 
                  id="username"
                  type="text" 
                  placeholder="O teu Nome" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-control"
                />
              </div>
              
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="input-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    id="password"
                    type={mostrarPassword ? "text" : "password"} 
                    placeholder="A tua Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-control"
                    style={{ paddingRight: '45px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{ 
                      position: 'absolute', right: '12px', top: '50%', 
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' 
                    }}
                  >
                    {mostrarPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              
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

            <form onSubmit={confirmarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={trustDevice} 
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    style={{ 
                      width: '18px', height: '18px', accentColor: 'var(--primary-color)',
                      cursor: 'pointer' 
                    }}
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
                onClick={voltarParaPassword}
                style={{ width: '100%', padding: '10px' }}
              >
                Voltar
              </button>
            </form>
          </>
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