import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // Segurança extra: Se não for admin, manda para o Dashboard normal
    if (role !== 'admin' || !token) {
      navigate('/dashboard');
      return;
    }

    // Função para ir buscar os utilizadores
    const carregarUtilizadores = async () => {
      try {
        const resposta = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}` // Passa o bilhete de entrada
          }
        });
        const dados = await resposta.json();
        
        if (resposta.ok) {
          setUsers(dados);
        } else {
          setErro(dados.error);
        }
      } catch (error) {
        setErro('Erro de ligação ao servidor.');
      }
    };

    carregarUtilizadores();
  }, [navigate]);

  const mudarPermissao = async (id, roleAtual) => {
    const novaRole = roleAtual === 'admin' ? 'user' : 'admin';
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: novaRole })
      });
      
      if (resposta.ok) {
        // Atualiza a lista na hora
        setUsers(users.map(u => u._id === id ? { ...u, role: novaRole } : u));
        alert('Permissões alteradas com sucesso!');
      }
    } catch (error) {
      alert('Erro ao alterar permissões.');
    }
  };

  const apagarUtilizador = async (id) => {
    if (!window.confirm('Tens a certeza que queres apagar esta conta para sempre?')) return;
    
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (resposta.ok) {
        setUsers(users.filter(u => u._id !== id));
        alert('Utilizador apagado!');
      }
    } catch (error) {
      alert('Erro ao apagar utilizador.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#ff4d4d', textAlign: 'center' }}>Painel do Chefe (Admin) 👑</h1>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
        ⬅ Voltar ao Dashboard
      </button>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nome</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Cargo</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.username}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: user.role === 'admin' ? 'red' : 'black' }}>
                {user.role}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                <button 
                  onClick={() => mudarPermissao(user._id, user.role)}
                  style={{ marginRight: '10px', padding: '5px', backgroundColor: '#e6e6ff', cursor: 'pointer' }}
                >
                  Tornar {user.role === 'admin' ? 'User' : 'Admin'}
                </button>
                <button 
                  onClick={() => apagarUtilizador(user._id)}
                  style={{ padding: '5px', backgroundColor: '#ffcccc', color: 'red', cursor: 'pointer' }}
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}