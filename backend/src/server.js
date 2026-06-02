const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (e.g., ngrok)
const PORT = process.env.PORT || 5000;

// Servir ficheiros estáticos do frontend (React)
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Middlewares (Regras de segurança e formato de dados)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Rotas de Autenticação (Login e Registo)
const authRoutes = require('./routes/auth');
const coupleRoutes = require('./routes/couple');
app.use('/api/auth', authRoutes);
app.use('/api/auth', coupleRoutes);

// NOVO: Rotas de Administrador
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Novas Rotas Funcionais (Mensagens, Fotos, Memórias)
const messageRoutes = require('./routes/messages');
const photoRoutes = require('./routes/photos');
const memoryRoutes = require('./routes/memories');
const albumRoutes = require('./routes/albums');
const quizRoutes = require('./routes/quizzes');
const eventRoutes = require('./routes/events');
const tabRoutes = require('./routes/tabs');
const funRoutes = require('./routes/fun');

app.use('/api/messages', messageRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/fun', funRoutes);

// Ligação ao MongoDB Atlas
const { startTimeCapsuleWorker } = require('./utils/timeCapsuleWorker');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Ligado com sucesso ao MongoDB Atlas!');
    // Iniciar verificação de cápsulas desbloqueadas no arranque
    startTimeCapsuleWorker();
  })
  .catch((err) => console.error('❌ Erro ao ligar ao MongoDB:', err));

// Fallback para o React Router (para qualquer rota que não seja da API)
app.get('*any', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('O backend do nosso site está vivo e a funcionar! (Dica: faça o build do frontend para ver o site aqui)');
    }
  });
});

// Centralized error handler middleware (must be registered last)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Arrancar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});