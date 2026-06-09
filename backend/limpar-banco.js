require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🔌 Ligado com sucesso ao MongoDB Atlas...');
    console.log('⏳ A apagar todas as coleções do banco de dados...');
    
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`🗑️ Limpa: ${collection.collectionName}`);
    }
    
    console.log('✨ Limpeza concluída! A base de dados foi totalmente limpa.');
    process.exit(0); // Fecha o script com sucesso
  })
  .catch((err) => {
    console.error('❌ Erro ao ligar ou limpar o banco de dados:', err);
    process.exit(1); // Fecha o script com erro
  });