import { apiFetch } from '../common/api';

export const adminService = {
  getUsers: () => {
    return apiFetch('/api/admin/users');
  },

  updateUserRole: (userId, role) => {
    return apiFetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: { role }
    });
  },

  deleteUser: (userId) => {
    return apiFetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  editUser: (userId, email, password) => {
    return apiFetch(`/api/admin/users/${userId}/editar`, {
      method: 'PUT',
      body: { email, password }
    });
  }
};
