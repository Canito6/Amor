import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  // Vai buscar a "role" (cargo) que guardámos no login para saber se é admin
  const roleGuardado = localStorage.getItem('role');

  // O useEffect corre automaticamente assim que a página abre
  useEffect(() => {
    // 1. Vai ao cofre do navegador ver se existe um bilhete (token) e o nome
    const token = localStorage.getItem('token');
    const nomeGuardado = localStorage.getItem('nome');

    // 2. Se não houver bilhete, expulsa a pessoa de volta para o Login (Segurança!)
    if (!token) {
      navigate('/');
    } else {
      // Se houver, guarda o nome para usarmos no ecrã
      setNome(nomeGuardado);
    }
  }, [navigate]);

  // Função para fazer Logout (Sair)
  const terminarSessao = () => {
    localStorage.clear(); // Limpa o cofre
    navigate('/'); // Volta para o ecrã inicial
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px', padding: '0 20px' }}>
      <h1>Bem-vindo(a), {nome}! ❤️</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>O que queres ver hoje?</p>

      {/* Caixa com os botões das secções */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        flexWrap: 'wrap',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        
        {/* Botão de Mensagens */}
        <button 
          style={{ padding: '20px', width: '150px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#ffe6e6', border: '2px solid #ffb3b3', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💌 Mensagens
        </button>

        {/* Botão de Fotos */}
        <button 
          style={{ padding: '20px', width: '150px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#e6ffe6', border: '2px solid #b3ffb3', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📸 Fotos
        </button>

        {/* Botão de Memórias */}
        <button 
          style={{ padding: '20px', width: '150px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#e6e6ff', border: '2px solid #b3b3ff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⏳ Memórias
        </button>
      </div>

      <br /><br />
      
      {/* Área dos botões de rodapé */}
      <div style={{ marginTop: '20px' }}>
        {/* O BOTÃO DE ADMIN - Só aparece se a role for 'admin' */}
        {roleGuardado === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            style={{ padding: '10px 20px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
          >
            👑 Painel de Admin
          </button>
        )}

        {/* Botão de Sair */}
        <button 
          onClick={terminarSessao}
          style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Sair / Logout
        </button>
      </div>
    </div>
  );
}