import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ForcarMudancaPassword() {
  const [novaPassword, setNovaPassword] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // Recebe o ID do utilizador vindo do Login

  if (!userId) {
    navigate('/'); // Se não houver ID, expulsa para o login
    return null;
  }

  const guardarNovaPassword = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const resposta = await fetch('http://localhost:5000/api/auth/forcar-mudanca-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, novaPassword })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        // Faz o login automático e guarda os dados
        localStorage.setItem('token', dados.token);
        localStorage.setItem('nome', dados.username);
        localStorage.setItem('role', dados.role);
        alert('A tua password foi atualizada! Bem-vindo(a).');
        navigate('/dashboard');
      } else {
        setErro(dados.error);
      }
    } catch (error) {
      setErro('Erro ao ligar ao servidor.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Aviso de Segurança ⚠️</h1>
      <p>O administrador repôs a tua password. Por favor, define uma nova e segura.</p>
      
      <form onSubmit={guardarNovaPassword} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <input 
          type="password" 
          placeholder="A tua Nova Password" 
          value={novaPassword}
          onChange={(e) => setNovaPassword(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Gravar e Entrar
        </button>
      </form>

      {erro && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}