import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const navigate = useNavigate();

  const fazerLogin = async (e) => {
    e.preventDefault(); 
    setErro(''); 

    try {
      const resposta = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        // NOVO: Verifica se temos de mandar a pessoa para o ecrã de mudar password
        if (dados.precisaMudarPassword) {
          navigate('/forcar-password', { state: { userId: dados.userId } });
          return; // Interrompe aqui para não fazer o login normal
        }

        // Se estiver tudo normal:
        localStorage.setItem('token', dados.token);
        localStorage.setItem('nome', dados.username);
        // Também guardamos a etiqueta para sabermos se é admin
        localStorage.setItem('role', dados.role); 
        navigate('/dashboard');
      } else {
        setErro(dados.error);
      }
    } catch (error) {
      setErro('Erro de ligação ao servidor.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>❤️ O Nosso Cantinho ❤️</h1>
      
      <form 
        onSubmit={fazerLogin} 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}
      >
        <input 
          type="text" 
          placeholder="O teu Nome" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', width: '220px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <div style={{ position: 'relative', width: '240px' }}>
          <input 
            type={mostrarPassword ? "text" : "password"} 
            placeholder="A tua Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', width: '220px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            style={{ 
              position: 'absolute', right: '10px', top: '10px', 
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' 
            }}
          >
            {mostrarPassword ? "🙈" : "👁️"}
          </button>
        </div>
        
        <button 
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Entrar
        </button>
      </form>

      {erro && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}

      <div style={{ marginTop: '25px', fontSize: '14px' }}>
        <p style={{ marginBottom: '10px' }}>
          <span 
            style={{ color: '#ff4d4d', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => navigate('/recuperar')}
          >
            Esqueceste-te da password?
          </span>
        </p>
        <p>
          Ainda não têm conta? <br/>
          <span 
            style={{ color: '#ff4d4d', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate('/registar')}
          >
            Criar conta nova
          </span>
        </p>
      </div>
    </div>
  );
}