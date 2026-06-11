import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/auth/adminService';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');

  const { language } = usePreferences();
  const t = translations[language];

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
      const dados = await adminService.getUsers();
      setUsers(dados);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao procurar utilizadores.' : 'Error fetching users.'));
    } finally {
      setLoading(false);
    }
  };

  // 1. MUDAR CARGO (Admin <-> User)
  const mudarPermissao = async (user) => {
    if (user.username === meuNome) {
      return alert(language === 'pt' ? 'Não podes tirar as tuas próprias permissões de Admin!' : 'You cannot remove your own Admin permissions!');
    }

    const novaRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await adminService.updateUserRole(user._id, novaRole);
      
      setUsers(users.map(u => u._id === user._id ? { ...u, role: novaRole } : u));
      alert(language === 'pt' ? 'Permissões alteradas com sucesso!' : 'Permissions updated successfully!');
    } catch (error) {
      alert(error.message || (language === 'pt' ? 'Erro ao alterar permissões.' : 'Error updating permissions.'));
    }
  };

  // 2. APAGAR UTILIZADOR
  const apagarUtilizador = async (user) => {
    if (user.username === meuNome) {
      return alert(language === 'pt' ? 'Não podes apagar a tua própria conta!' : 'You cannot delete your own account!');
    }

    if (!window.confirm(language === 'pt' ? `Tens a certeza que queres apagar o/a ${user.username} para sempre?` : `Are you sure you want to delete ${user.username} forever?`)) return;

    try {
      await adminService.deleteUser(user._id);
      
      setUsers(users.filter(u => u._id !== user._id));
      alert(language === 'pt' ? 'Utilizador apagado com sucesso!' : 'User deleted successfully!');
    } catch (error) {
      alert(error.message || (language === 'pt' ? 'Erro ao apagar utilizador.' : 'Error deleting user.'));
    }
  };

  // 3. EDITAR EMAIL E/OU PASSWORD
  const editarUtilizador = async (user) => {
    const novoEmail = window.prompt(language === 'pt' ? `Editar o email de ${user.username}:` : `Edit email for ${user.username}:`, user.email);
    if (novoEmail === null) return; 

    const novaPassword = window.prompt(language === 'pt' 
      ? `Queres mudar a password do/a ${user.username}?\n\nEscreve a password temporária (Deixa em branco se NÃO quiseres alterar a password):` 
      : `Do you want to change the password for ${user.username}?\n\nType the temporary password (Leave blank if you do NOT want to change the password):`);
    if (novaPassword === null) return; 

    const corpo = {};
    if (novoEmail.trim() !== user.email) corpo.email = novoEmail.trim();
    if (novaPassword.trim() !== '') corpo.password = novaPassword.trim();

    if (Object.keys(corpo).length === 0) {
      return alert(language === 'pt' ? 'Nenhuma alteração foi feita.' : 'No changes were made.');
    }

    try {
      await adminService.editUser(user._id, corpo.email, corpo.password);
      
      setUsers(users.map(u => u._id === user._id ? { ...u, email: novoEmail || u.email } : u));
      
      if (corpo.password) {
        alert(language === 'pt' 
          ? 'Utilizador atualizado! Na próxima vez que ele entrar, o site vai obrigá-lo a escolher uma password nova.' 
          : 'User updated! Next time they log in, the website will require them to choose a new password.');
      } else {
        alert(language === 'pt' ? 'Email atualizado com sucesso!' : 'Email updated successfully!');
      }
    } catch (error) {
      alert(error.message || (language === 'pt' ? 'Erro ao editar utilizador.' : 'Error editing user.'));
    }
  };

  return (
    <div className="app-container fade-in">
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{language === 'pt' ? 'Painel do Chefe 👑' : 'Admin Panel 👑'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      {erro && (
        <div style={{ marginBottom: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
          <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>{language === 'pt' ? 'Gestão de Contas do Cantinho' : "Corner's Account Management"}</h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>{language === 'pt' ? 'A carregar utilizadores... ⏳' : 'Loading users... ⏳'}</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{language === 'pt' ? 'Nome' : 'Name'}</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>{language === 'pt' ? 'Cargo' : 'Role'}</th>
                  <th style={{ textAlign: 'center' }}>{language === 'pt' ? 'Ações' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: '600' }}>
                      {user.username} {user.username === meuNome && <span style={{ color: 'var(--primary-color)' }}>{language === 'pt' ? '(Tu)' : '(You)'}</span>}
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
                          ✏️ {language === 'pt' ? 'Editar' : 'Edit'}
                        </button>
                        <button 
                          onClick={() => mudarPermissao(user)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          {language === 'pt' ? 'Tornar' : 'Make'} {user.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        {user.username !== meuNome && (
                          <button 
                            onClick={() => apagarUtilizador(user)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                          >
                            {language === 'pt' ? 'Apagar' : 'Delete'}
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