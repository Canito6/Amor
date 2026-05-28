import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const resposta = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, codigoAdmin })
      });
      
      const dados = await resposta.json();

      if (resposta.ok) {
        setSucesso('Conta criada com sucesso! A redirecionar para o Login... 🚀');
        setTimeout(() => navigate('/'), 2000); // Vai para o login ao fim de 2 segundos
      } else {
        setErro(dados.error);
      }
    } catch (error) {
      setErro('Erro de ligação ao servidor.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Criar Nova Conta ✨</h1>
      
      <form onSubmit={criarConta} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="O teu Nome" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="email" 
          placeholder="O teu Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="password" 
          placeholder="A tua Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        {/* Campo secreto para o Admin */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
          <input 
            type="password" 
            placeholder="Código Admin (Opcional)" 
            value={codigoAdmin}
            onChange={(e) => setCodigoAdmin(e.target.value)}
            style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px dashed #ff4d4d', backgroundColor: '#fff5f5' }}
          />
          <span style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
            *Deixa em branco para conta normal
          </span>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Registar
        </button>
      </form>

      {erro && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      {sucesso && <p style={{ color: 'green', marginTop: '15px', fontWeight: 'bold' }}>{sucesso}</p>}
      
      <p style={{ marginTop: '30px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao Login
        </button>
      </p>
    </div>
  );
}