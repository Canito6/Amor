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

  // Adiciona o token de autorização se existir
  if (token) {
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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body,
    credentials: 'include' // Envia e recebe cookies HTTP-Only de sessão automaticamente
  });

  // Tenta extrair a resposta como JSON
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(data.error || `Erro do servidor (${response.status})`);
  }

  return data;
}
