import { useNavigate } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import SecurityMethodSelector from '../components/auth/SecurityMethodSelector';
import useRegisterForm from '../hooks/useRegisterForm';

export default function Registar() {
  const navigate = useNavigate();

  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    codigoAdmin,
    setCodigoAdmin,
    loginSecurityMethod,
    setLoginSecurityMethod,
    phoneNumber,
    setPhoneNumber,
    inviteCode,
    setInviteCode,
    erro,
    sucesso,
    criarConta
  } = useRegisterForm(navigate);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '30px', marginBottom: '10px' }}>Criar Nova Conta ✨</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Junta-te ao nosso cantinho de amor</p>
        
        <form onSubmit={criarConta} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
            id="email"
            label="Email"
            type="email"
            placeholder="O teu Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <SecurityMethodSelector
            value={loginSecurityMethod}
            onChange={setLoginSecurityMethod}
          />

          {loginSecurityMethod === 'mobile' && (
            <AuthInput
              id="phone"
              label="Número de Telemóvel"
              type="tel"
              placeholder="Ex: +351 912 345 678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          )}

          <div className="form-group">
            <label className="input-label" htmlFor="inviteCode">Código de Convite do Parceiro (Opcional)</label>
            <input 
              id="inviteCode"
              type="text" 
              placeholder="Ex: 60a7fc9..." 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="input-control"
              style={{ borderStyle: 'dashed', borderColor: 'var(--primary-color)' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left', marginTop: '2px' }}>
              *Introduz o código que o teu parceiro partilhou para se ligarem imediatamente!
            </span>
          </div>
          
          <AuthInput
            id="codigoAdmin"
            label="Código Admin (Opcional)"
            type="password"
            placeholder="Código Admin"
            value={codigoAdmin}
            onChange={(e) => setCodigoAdmin(e.target.value)}
            style={{ borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)' }}
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Registar Conta ✨
          </button>
        </form>

        {erro && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
          </div>
        )}
        
        {sucesso && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
            <p style={{ color: 'var(--success-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{sucesso}</p>
          </div>
        )}
        
        <div style={{ marginTop: '25px', borderTop: '1px dashed rgba(0, 0, 0, 0.1)', paddingTop: '20px' }}>
          <button onClick={() => navigate('/')} className="btn btn-dark" style={{ width: '100%' }}>
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}