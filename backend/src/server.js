const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares (Regras de segurança e formato de dados)
app.use(cors());
app.use(express.json());

// Rotas de Autenticação (Login e Registo)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

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

app.use('/api/messages', messageRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tabs', tabRoutes);

// Ligação ao MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Ligado com sucesso ao MongoDB Atlas!'))
  .catch((err) => console.error('❌ Erro ao ligar ao MongoDB:', err));

// Rota de teste inicial
app.get('/', (req, res) => {
  res.send('O backend do nosso site está vivo e a funcionar!');
});

// Arrancar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});