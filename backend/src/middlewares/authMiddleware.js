const jwt = require('jsonwebtoken');

const verificarAdmin = (req, res, next) => {
  // O token vem no cabeçalho da requisição no formato "Bearer <token>"
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Não tens o bilhete de entrada.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica se o utilizador tem a role de 'admin'
    if (decodificado.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Esta área é apenas para Administradores.' });
    }
    
    req.user = decodificado;
    next(); // Se estiver tudo bem, avança para a rota!
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = { verificarAdmin };