import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecuperarPassword() {
  // Estados para guardar o que escrevemos
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  
  // Etapa 1 = Pedir Email | Etapa 2 = Pedir Código e Nova Password
  const [etapa, setEtapa] = useState(1);
  
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();

  // Função para pedir o código (Etapa 1)
  const pedirCodigo = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('A enviar email... ⏳');

    try {
      const resposta = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem(dados.message); // "Email enviado!"
        setEtapa(2); // Avança para a fase do código
      } else {
        setMensagem('');
        setErro(dados.error);
      }
    } catch (error) {
      setMensagem('');
      setErro('Erro de ligação ao servidor.');
    }
  };

  // Função para guardar a nova password (Etapa 2)
  const redefinirPassword = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('A verificar... ⏳');

    try {
      const resposta = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, novaPassword })
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Password alterada com sucesso! Podes fazer login.');
        navigate('/'); // Volta para o login
      } else {
        setMensagem('');
        setErro(dados.error);
      }
    } catch (error) {
      setMensagem('');
      setErro('Erro de ligação ao servidor.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Recuperar Password 🔐</h1>
      
      {etapa === 1 && (
        <form onSubmit={pedirCodigo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <p>Escreve o teu email para receberes o código de 6 números.</p>
          <input 
            type="email" 
            placeholder="O teu Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Enviar Código
          </button>
        </form>
      )}

      {etapa === 2 && (
        <form onSubmit={redefinirPassword} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <p style={{ color: 'green', fontWeight: 'bold' }}>Código enviado para o teu email!</p>
          
          <input 
            type="text" 
            placeholder="Código de 6 números" 
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '2px' }}
          />
          <input 
            type="password" 
            placeholder="A tua Nova Password" 
            value={novaPassword}
            onChange={(e) => setNovaPassword(e.target.value)}
            required
            style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Guardar Nova Password
          </button>
        </form>
      )}

      {/* Mensagens de sucesso ou erro */}
      {mensagem && etapa === 1 && <p style={{ color: '#666', marginTop: '15px' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      
      <p style={{ marginTop: '30px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao Login
        </button>
      </p>
    </div>
  );
}