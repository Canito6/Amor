import { useNavigate } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import SecurityMethodSelector from '../../components/auth/SecurityMethodSelector';
import useRegisterForm from '../../hooks/auth/useRegisterForm';

export default function Registar() {
  const navigate = useNavigate();

  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loginSecurityMethod,
    setLoginSecurityMethod,
    inviteCode,
    setInviteCode,
    isSubmitting,
    erro,
    sucesso,
    errors,
    handleBlur,
    isUsernameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isFormValid,
    criarConta
  } = useRegisterForm(navigate);

  return (
    <div className="auth-container" style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>
      <div className="glass-panel auth-card fade-in" style={{ width: '100%', padding: '28px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0' }}>Criar Nova Conta ✨</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
            Junta-te ao nosso cantinho de amor
          </p>
        </div>
        
        <form onSubmit={criarConta} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <AuthInput
            id="username"
            label="Utilizador"
            type="text"
            placeholder="O teu Nome (min. 3 caracteres)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur('username')}
            error={errors.username}
            success={isUsernameValid}
            required
          />
          
          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            success={isEmailValid}
            required
          />
          
          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="Mínimo 8 caracteres (1 letra e 1 número)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            success={isPasswordValid}
            helperText="Pelo menos 8 caracteres, com letra e número"
            required
          />

          <AuthInput
            id="confirmPassword"
            label="Confirmar Password"
            type="password"
            placeholder="Repete a tua password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            success={isConfirmPasswordValid}
            required
          />

          <SecurityMethodSelector
            value={loginSecurityMethod}
            onChange={setLoginSecurityMethod}
          />

          <div className="form-group" style={{ marginBottom: '16px' }}>
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
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left', marginTop: '4px' }}>
              *Introduz o código que o teu parceiro partilhou para se ligarem imediatamente!
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting || !isFormValid}
            style={{ 
              width: '100%', 
              marginTop: '10px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              opacity: (isSubmitting || !isFormValid) ? 0.7 : 1,
              cursor: (isSubmitting || !isFormValid) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'A criar conta... ✨' : 'Registar Conta ✨'}
          </button>
        </form>

        {erro && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
              {erro}
            </p>
          </div>
        )}
        
        {sucesso && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
            <p style={{ color: 'var(--success-color)', fontSize: '14px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
              {sucesso}
            </p>
          </div>
        )}
        
        <div style={{ marginTop: '25px', borderTop: '1px dashed rgba(0, 0, 0, 0.1)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Já tens uma conta?
          </p>
          <button onClick={() => navigate('/')} className="btn btn-dark" style={{ width: '100%', padding: '12px' }}>
            Voltar ao Login 🔒
          </button>
        </div>
      </div>
    </div>
  );
}
