import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
      const dados = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      });

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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '32px', marginBottom: '10px' }}>O Nosso Cantinho ❤️</h1>
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

        {erro && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
          </div>
        )}

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
      </div>
    </div>
  );
}