import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/auth/adminService';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { translations } from '../../services/common/translations';
import UserTable from '../../components/admin/UserTable';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');

  const { language } = usePreferences();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
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
      showToast(language === 'pt' ? 'Não podes tirar as tuas próprias permissões de Admin!' : 'You cannot remove your own Admin permissions!', 'error');
      return;
    }

    const novaRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      await adminService.updateUserRole(user._id, novaRole);
      
      setUsers(users.map(u => u._id === user._id ? { ...u, role: novaRole } : u));
      showToast(language === 'pt' ? 'Permissões alteradas com sucesso!' : 'Permissions updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || (language === 'pt' ? 'Erro ao alterar permissões.' : 'Error updating permissions.'), 'error');
    }
  };

  // 2. APAGAR UTILIZADOR
  const apagarUtilizador = async (user) => {
    if (user.username === meuNome) {
      showToast(language === 'pt' ? 'Não podes apagar a tua própria conta!' : 'You cannot delete your own account!', 'error');
      return;
    }

    const ok = await confirm({
      title: language === 'pt' ? 'Apagar Utilizador' : 'Delete User',
      message: language === 'pt' ? `Tens a certeza que queres apagar o/a ${user.username} para sempre?` : `Are you sure you want to delete ${user.username} forever?`,
      confirmText: t.delete || 'Apagar',
      cancelText: t.cancel || 'Cancelar',
    });
    if (!ok) return;

    try {
      await adminService.deleteUser(user._id);
      
      setUsers(users.filter(u => u._id !== user._id));
      showToast(language === 'pt' ? 'Utilizador apagado com sucesso!' : 'User deleted successfully!', 'success');
    } catch (error) {
      showToast(error.message || (language === 'pt' ? 'Erro ao apagar utilizador.' : 'Error deleting user.'), 'error');
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
      showToast(language === 'pt' ? 'Nenhuma alteração foi feita.' : 'No changes were made.', 'info');
      return;
    }

    try {
      await adminService.editUser(user._id, corpo.email, corpo.password);
      
      setUsers(users.map(u => u._id === user._id ? { ...u, email: novoEmail || u.email } : u));
      
      if (corpo.password) {
        showToast(language === 'pt' 
          ? 'Utilizador atualizado! Na próxima vez que ele entrar, o site vai obrigá-lo a escolher uma password nova.' 
          : 'User updated! Next time they log in, the website will require them to choose a new password.', 'success');
      } else {
        showToast(language === 'pt' ? 'Email atualizado com sucesso!' : 'Email updated successfully!', 'success');
      }
    } catch (error) {
      showToast(error.message || (language === 'pt' ? 'Erro ao editar utilizador.' : 'Error editing user.'), 'error');
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
          <UserTable
            users={users}
            meuNome={meuNome}
            language={language}
            t={t}
            onEditUser={editarUtilizador}
            onChangeUserRole={mudarPermissao}
            onDeleteUser={apagarUtilizador}
          />
        )}
      </div>
    </div>
  );
}