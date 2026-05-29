import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // URL da API preparada para quando publicares o site na net, ou usa o localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Vamos buscar o nome do admin atual para impedir que ele se apague a si próprio
  const meuNome = localStorage.getItem('nome');

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
        const resposta = await fetch(`${API_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
  }, [navigate, API_URL]);

  // 1. MUDAR CARGO (Admin <-> User)
  const mudarPermissao = async (user) => {
    // PROTEÇÃO: O admin não pode tirar os seus próprios poderes
    if (user.username === meuNome) {
      return alert('Não podes tirar as tuas próprias permissões de Admin!');
    }

    const novaRole = user.role === 'admin' ? 'user' : 'admin';
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`${API_URL}/api/admin/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: novaRole })
      });
      
      if (resposta.ok) {
        setUsers(users.map(u => u._id === user._id ? { ...u, role: novaRole } : u));
        alert('Permissões alteradas com sucesso!');
      } else {
        alert('O servidor recusou a ação.');
      }
    } catch (error) {
      alert('Erro ao alterar permissões.');
    }
  };

  // 2. APAGAR UTILIZADOR
  const apagarUtilizador = async (user) => {
    // PROTEÇÃO: O admin não pode apagar a sua própria conta
    if (user.username === meuNome) {
      return alert('Não podes apagar a tua própria conta!');
    }

    if (!window.confirm(`Tens a certeza que queres apagar o/a ${user.username} para sempre?`)) return;
    
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`${API_URL}/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (resposta.ok) {
        setUsers(users.filter(u => u._id !== user._id));
        alert('Utilizador apagado!');
      } else {
        alert('Erro ao apagar no servidor.');
      }
    } catch (error) {
      alert('Erro ao apagar utilizador.');
    }
  };

  // 3. EDITAR EMAIL E/OU PASSWORD (NOVO!)
  const editarUtilizador = async (user) => {
    // Pergunta qual é o novo email (já traz o email atual escrito na caixa)
    const novoEmail = window.prompt(`Editar o email de ${user.username}:`, user.email);
    if (novoEmail === null) return; // Se clicou em "Cancelar", paramos aqui

    // Pergunta se quer mudar a password (deixa em branco por defeito)
    const novaPassword = window.prompt(`Queres mudar a password do/a ${user.username}?\n\nEscreve a password temporária (Deixa em branco se NÃO quiseres alterar a password):`);
    if (novaPassword === null) return; // Cancelou

    // Prepara os dados a enviar para o Backend
    const corpo = {};
    if (novoEmail.trim() !== user.email) corpo.email = novoEmail.trim();
    if (novaPassword.trim() !== '') corpo.password = novaPassword.trim();

    // Se não escreveu nada de novo nem no email nem na password, não vale a pena chatear o servidor
    if (Object.keys(corpo).length === 0) {
      return alert('Nenhuma alteração foi feita.');
    }

    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`${API_URL}/api/admin/users/${user._id}/editar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(corpo)
      });
      
      if (resposta.ok) {
        // Atualiza a tabela na hora para mostrar o novo email
        setUsers(users.map(u => u._id === user._id ? { ...u, email: novoEmail || u.email } : u));
        
        if (corpo.password) {
          alert('Utilizador atualizado! Na próxima vez que ele entrar, o site vai obrigá-lo a escolher uma password nova.');
        } else {
          alert('Email atualizado com sucesso!');
        }
      } else {
        const erroDados = await resposta.json();
        alert(`Erro: ${erroDados.error}`);
      }
    } catch (error) {
      alert('Erro ao ligar ao servidor para editar utilizador.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#ff4d4d', textAlign: 'center' }}>Painel do Chefe (Admin) 👑</h1>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px', borderRadius: '5px' }}>
        ⬅ Voltar ao Dashboard
      </button>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Cargo</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                {user.username} {user.username === meuNome && '(Tu)'}
              </td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: user.role === 'admin' ? 'red' : '#333' }}>
                {user.role}
              </td>
              <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                {/* BOTÃO EDITAR EMAIL/PASSWORD */}
                <button 
                  onClick={() => editarUtilizador(user)}
                  style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✏️ Editar
                </button>

                {/* BOTÃO MUDAR CARGO */}
                <button 
                  onClick={() => mudarPermissao(user)}
                  style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Tornar {user.role === 'admin' ? 'User' : 'Admin'}
                </button>

                {/* BOTÃO APAGAR */}
                <button 
                  onClick={() => apagarUtilizador(user)}
                  style={{ padding: '6px 12px', backgroundColor: '#fff1f0', border: '1px solid #ffa39e', color: 'red', borderRadius: '4px', cursor: 'pointer' }}
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