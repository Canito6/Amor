const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' && window.location.port === '5173' ? 'http://localhost:5000' : '');

/**
 * Função utilitária para efetuar pedidos à API do backend
 * @param {string} endpoint - Rota relativa (ex: '/api/auth/login')
 * @param {object} options - Opções do fetch (method, body, headers, etc)
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Inicializa o objeto de cabeçalhos
  const headers = { ...options.headers };

  // Adiciona o token de autorização se existir e for um token JWT real
  if (token && token !== 'session_active') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepara o corpo da requisição
  let body = options.body;
  
  if (body) {
    // Se o corpo for FormData (usado para upload de ficheiros), o browser define o Content-Type correto sozinho.
    // Caso contrário, assumimos que é JSON.
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      body,
      credentials: 'include' // Envia e recebe cookies HTTP-Only de sessão automaticamente
    });
  } catch {
    throw new Error('Não foi possível estabelecer ligação ao servidor. Por favor, verifica a tua ligação.');
  }

  // Tenta extrair a resposta como JSON
  let data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
      // Tentar renovar o token
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.token) {
            localStorage.setItem('token', refreshData.token);
            // Repetir o pedido original com o novo token
            headers['Authorization'] = `Bearer ${refreshData.token}`;
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
              body,
              credentials: 'include'
            });
            const retryData = await retryRes.json().catch(() => ({}));
            if (retryRes.ok) {
              return retryData;
            }
          }
        }
      } catch (refreshErr) {
        console.error('Erro ao tentar renovar token:', refreshErr);
      }

      localStorage.clear();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(data.error || `Erro do servidor (${response.status})`);
  }

  return data;
}
