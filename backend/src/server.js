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
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Inicializar ouvintes do EventBus (Localizados em src/listeners/notificationListener)
const { initNotificationListener } = require('./listeners/notificationListener');
initNotificationListener(io);

io.on('connection', (socket) => {
  socket.on('join-couple', (coupleId) => {
    if (coupleId) {
      socket.join(coupleId);
      logger.info(`User socket joined couple room: ${coupleId}`);
    }
  });

  socket.on('typing', (data) => {
    if (data.room) {
      socket.to(data.room).emit('partner-typing', { user: data.user });
    }
  });

  socket.on('stop-typing', (data) => {
    if (data.room) {
      socket.to(data.room).emit('partner-stop-typing', { user: data.user });
    }
  });

  socket.on('draw-line', (data) => {
    if (data.room) {
      socket.to(data.room).emit('partner-draw-line', data);
    }
  });

  socket.on('clear-canvas', (data) => {
    if (data.room) {
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