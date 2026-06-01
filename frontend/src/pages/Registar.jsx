import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Registar() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoAdmin, setCodigoAdmin] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const criarConta = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      const dados = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password, codigoAdmin }
      });
      
      setSucesso('Conta criada com sucesso! A redirecionar para o Login... 🚀');
      setTimeout(() => navigate('/'), 2000); 
    } catch (error) {
      setErro(error.message || 'Erro ao criar conta.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '30px', marginBottom: '10px' }}>Criar Nova Conta ✨</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Junta-te ao nosso cantinho de amor</p>
        
        <form onSubmit={criarConta} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
          
          <div className="form-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="O teu Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-control"
            />
          </div>
          
          <div className="form-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="A tua Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-control"
            />
          </div>
          
          <div className="form-group">
            <label className="input-label" htmlFor="codigoAdmin">Código Admin (Opcional)</label>
            <input 
              id="codigoAdmin"
              type="password" 
              placeholder="Código Admin" 
              value={codigoAdmin}
              onChange={(e) => setCodigoAdmin(e.target.value)}
              className="input-control"
              style={{ borderStyle: 'dashed', borderColor: 'var(--primary-color)' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left', marginTop: '2px' }}>
              *Deixa em branco se for uma conta normal.
            </span>
          </div>

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