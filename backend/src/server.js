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