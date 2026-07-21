const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token && token !== 'session_active') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' && window.location.port === '5173' ? 'http://localhost:5000' : '');

export const cycleService = {
  async getEntries() {
    const res = await fetch(`${API_BASE}/api/cycle/entries`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao carregar registos de ciclo.');
    }
    return res.json();
  },

  async createOrUpdateEntry(data) {
    const res = await fetch(`${API_BASE}/api/cycle/entries`, {
      method: 'POST',
      headers: getAuthHeader(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao guardar registo de ciclo.');
    }
    return res.json();
  },

  async deleteEntry(id) {
    const res = await fetch(`${API_BASE}/api/cycle/entries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao eliminar registo de ciclo.');
    }
    return res.json();
  },

  async deleteAllEntries() {
    const res = await fetch(`${API_BASE}/api/cycle/entries`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao eliminar histórico de ciclo.');
    }
    return res.json();
  },

  async getSummary() {
    const res = await fetch(`${API_BASE}/api/cycle/summary`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao obter resumo do ciclo.');
    }
    return res.json();
  },

  async updatePreferences(prefs) {
    const res = await fetch(`${API_BASE}/api/cycle/preferences`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      credentials: 'include',
      body: JSON.stringify(prefs)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar preferências.');
    }
    return res.json();
  },

  async getPartnerSummary() {
    const res = await fetch(`${API_BASE}/api/cycle/partner-summary`, {
      headers: getAuthHeader(),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao carregar resumo do parceiro.');
    }
    return res.json();
  }
};
