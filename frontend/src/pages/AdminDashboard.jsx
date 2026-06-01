import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // Segurança extra: Se não for admin, manda para o Dashboard normal
    if (role !== 'admin' || !token) {
      navigate('/dashboard');
      return;
    }

    carregarUtilizadores();
  }, [navigate]);

  const carregarUtilizadores = async () => {
    try {
      setLoading(true);
      const dados = await apiFetch('/api/admin/users');
      setUsers(dados);
    } catch (err) {
      setErro(err.message || 'Erro ao procurar utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  // 1. MUDAR CARGO (Admin <-> User)
  const mudarPermissao = async (user) => {
    if (user.username === meuNome) {
      return alert('Não podes tirar as tuas próprias permissões de Admin!');
    }

    const novaRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await apiFetch(`/api/admin/users/${user._id}/role`, {
        method: 'PUT',
        body: { role: novaRole }
      });
      
      setUsers(users.map(u => u._id === user._id ? { ...u, role: novaRole } : u));
      alert('Permissões alteradas com sucesso!');
    } catch (error) {
      alert(error.message || 'Erro ao alterar permissões.');
    }
  };

  // 2. APAGAR UTILIZADOR
  const apagarUtilizador = async (user) => {
    if (user.username === meuNome) {
      return alert('Não podes apagar a tua própria conta!');
    }

    if (!window.confirm(`Tens a certeza que queres apagar o/a ${user.username} para sempre?`)) return;

    try {
      await apiFetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE'
      });
      
      setUsers(users.filter(u => u._id !== user._id));
      alert('Utilizador apagado com sucesso!');
    } catch (error) {
      alert(error.message || 'Erro ao apagar utilizador.');
    }
  };

  // 3. EDITAR EMAIL E/OU PASSWORD
  const editarUtilizador = async (user) => {
    const novoEmail = window.prompt(`Editar o email de ${user.username}:`, user.email);
    if (novoEmail === null) return; 

    const novaPassword = window.prompt(`Queres mudar a password do/a ${user.username}?\n\nEscreve a password temporária (Deixa em branco se NÃO quiseres alterar a password):`);
    if (novaPassword === null) return; 

    const corpo = {};
    if (novoEmail.trim() !== user.email) corpo.email = novoEmail.trim();
    if (novaPassword.trim() !== '') corpo.password = novaPassword.trim();

    if (Object.keys(corpo).length === 0) {
      return alert('Nenhuma alteração foi feita.');
    }

    try {
      await apiFetch(`/api/admin/users/${user._id}/editar`, {
        method: 'PUT',
        body: corpo
      });
      
      setUsers(users.map(u => u._id === user._id ? { ...u, email: novoEmail || u.email } : u));
      
      if (corpo.password) {
        alert('Utilizador atualizado! Na próxima vez que ele entrar, o site vai obrigá-lo a escolher uma password nova.');
      } else {
        alert('Email atualizado com sucesso!');
      }
    } catch (error) {
      alert(error.message || 'Erro ao editar utilizador.');
    }
  };

  return (
    <div className="app-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>Painel do Chefe 👑</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {erro && (
        <div style={{ marginBottom: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
          <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Gestão de Contas do Cantinho</h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>A carregar utilizadores... ⏳</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>Cargo</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: '600' }}>
                      {user.username} {user.username === meuNome && <span style={{ color: 'var(--primary-color)' }}>(Tu)</span>}
                    </td>
                    <td>{user.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span 
                        style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '13px',
                          fontWeight: '700',
                          backgroundColor: user.role === 'admin' ? '#ffe3e3' : '#e6fffa',
                          color: user.role === 'admin' ? 'var(--danger-color)' : 'var(--success-color)'
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => editarUtilizador(user)}
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#e2e8f0', color: '#4a5568' }}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => mudarPermissao(user)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Tornar {user.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        {user.username !== meuNome && (
                          <button 
                            onClick={() => apagarUtilizador(user)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            Apagar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}