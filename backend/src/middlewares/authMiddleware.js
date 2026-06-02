const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificarAdmin = async (req, res, next) => {
  // O token pode vir no cookie 'token' ou no cabeçalho 'Authorization: Bearer <token>'
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Não tens o bilhete de entrada.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica se o utilizador tem a role de 'admin'
    if (decodificado.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Esta área é apenas para Administradores.' });
    }
    
    const user = await User.findById(decodificado.id);
    if (!user) {
      return res.status(401).json({ error: 'Utilizador não encontrado.' });
    }

    req.user = decodificado;
    req.coupleId = user.coupleId || 'default_couple';
    next(); // Se estiver tudo bem, avança para a rota!
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

const verificarToken = async (req, res, next) => {
  // O token pode vir no cookie 'token' ou no cabeçalho 'Authorization: Bearer <token>'
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Não tens o bilhete de entrada.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodificado.id);
    if (!user) {
      return res.status(401).json({ error: 'Utilizador não encontrado.' });
    }
    req.user = decodificado;
    req.coupleId = user.coupleId || 'default_couple';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = { verificarAdmin, verificarToken };