import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../context/ToastContext';

export default function ForcarMudancaPassword() {
  const [novaPassword, setNovaPassword] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const userId = location.state?.userId; // Recebe o ID do utilizador vindo do Login

  if (!userId) {
    navigate('/'); 
    return null;
  }

  const guardarNovaPassword = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const dados = await authService.forcarMudancaPassword(userId, novaPassword);

      // Faz o login automático e guarda os dados
      localStorage.setItem('token', dados.token);
      localStorage.setItem('nome', dados.username);
      localStorage.setItem('role', dados.role);
      localStorage.setItem('coupleId', dados.coupleId || '');
      window.dispatchEvent(new Event('authChange'));
      showToast('A tua password foi atualizada! Bem-vindo(a). 🎉', 'success');
      navigate('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao tentar definir nova password.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '20px' }}>
      <div className="glass-panel auth-card fade-in">
        <h1 style={{ color: 'var(--danger-color)', fontSize: '28px', marginBottom: '10px' }}>Aviso de Segurança ⚠️</h1>
        <p style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '14px' }}>
          O administrador repôs a tua password. Por favor, define uma nova credencial segura para aceder.
        </p>
        
        <form onSubmit={guardarNovaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label" htmlFor="novaPassword">A tua Nova Password</label>
            <input 
              id="novaPassword"
              type="password" 
              placeholder="Escreve a tua nova password" 
              value={novaPassword}
              onChange={(e) => setNovaPassword(e.target.value)}
              required
              className="input-control"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '5px' }}>
            Gravar e Entrar no Site 🚀
          </button>
        </form>

        {erro && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
          </div>
        )}
      </div>
    </div>
  );
}