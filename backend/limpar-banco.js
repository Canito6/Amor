require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User'); // O teu molde de utilizador

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🔌 Ligado com sucesso ao MongoDB Atlas...');
    console.log('⏳ A apagar todos os utilizadores...');
    
    // O comando mágico que apaga TODOS os documentos da coleção de Utilizadores
    await User.deleteMany({});
    
    console.log('🗑️ Limpeza concluída! Todos os utilizadores foram eliminados.');
    process.exit(0); // Fecha o script com sucesso
  })
  .catch((err) => {
    console.error('❌ Erro ao ligar ou limpar o banco de dados:', err);
    process.exit(1); // Fecha o script com erro
  });