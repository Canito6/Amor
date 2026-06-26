require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// 1. Ligação ao MongoDB Atlas
connectDB();

const server = http.createServer(app);
const jwt = require('jsonwebtoken'); // [SEGURANÇA - VULN-009] Requerido para verificar sockets

// [SEGURANÇA - VULN-009] Helper manual para analisar cookies do socket handshake
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(item => {
    const parts = item.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const val = parts.slice(1).join('=');
      cookies[name] = decodeURIComponent(val);
    }
  });
  return cookies;
};

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// [SEGURANÇA - VULN-009] Middleware para autenticar conexões WebSocket
io.use((socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie || '';
    const parsedCookies = parseCookies(rawCookies);
    const token = parsedCookies.token || socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Acesso negado. Token de autenticação em falta.'));
    }

    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decodificado;
    next();
  } catch (err) {
    return next(new Error('Acesso negado. Token inválido ou expirado.'));
  }
});

// Inicializar ouvintes do EventBus (Localizados em src/listeners/notificationListener)
const { initNotificationListener } = require('./listeners/notificationListener');
initNotificationListener(io);

io.on('connection', (socket) => {
  socket.on('join-couple', (coupleId) => {
    // [SEGURANÇA - VULN-009] Autorização de sala: apenas permite juntar-se à própria sala do casal ou se for administrador
    if (coupleId && (socket.user.coupleId === coupleId || socket.user.role === 'admin')) {
      socket.join(coupleId);
      logger.info(`User socket ${socket.user.username} joined couple room: ${coupleId}`);
    } else {
      logger.warn(`Tentativa de subscrição não autorizada na sala: ${coupleId} pelo utilizador: ${socket.user?.username}`);
    }
  });

  socket.on('typing', (data) => {
    // [SEGURANÇA - VULN-009] Impedir spoofing e fuga de informação validando a sala e injetando o username real autenticado
    if (data.room && (socket.user.coupleId === data.room || socket.user.role === 'admin')) {
      socket.to(data.room).emit('partner-typing', { user: socket.user.username });
    }
  });

  socket.on('stop-typing', (data) => {
    // [SEGURANÇA - VULN-009] Impedir spoofing e fuga de informação
    if (data.room && (socket.user.coupleId === data.room || socket.user.role === 'admin')) {
      socket.to(data.room).emit('partner-stop-typing', { user: socket.user.username });
    }
  });

  socket.on('draw-line', (data) => {
    // [SEGURANÇA - VULN-009] Impedir fuga de informação para outras salas
    if (data.room && (socket.user.coupleId === data.room || socket.user.role === 'admin')) {
      socket.to(data.room).emit('partner-draw-line', data);
    }
  });

  socket.on('clear-canvas', (data) => {
    // [SEGURANÇA - VULN-009] Impedir fuga de informação para outras salas
    if (data.room && (socket.user.coupleId === data.room || socket.user.role === 'admin')) {
      socket.to(data.room).emit('partner-clear-canvas');
    }
  });
});

app.set('io', io);

// 2. Inicialização da Escuta de Porta (ignorada em ambiente de testes)
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 Servidor a correr na porta ${PORT}`);
  });
}

module.exports = app;