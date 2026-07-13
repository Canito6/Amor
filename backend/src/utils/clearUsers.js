require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/auth/userModel');

const clearUsers = async () => {
  try {
    console.log('A ligar ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Ligação ao MongoDB estabelecida.');

    console.log('A contar utilizadores na base de dados...');
    const countBefore = await User.countDocuments({});
    console.log(`Encontrados ${countBefore} utilizadores.`);

    if (countBefore === 0) {
      console.log('Não existem utilizadores para remover.');
    } else {
      console.log('A remover todos os utilizadores...');
      const result = await User.deleteMany({});
      console.log(`Removidos com sucesso! Detalhes:`, result);
    }

  } catch (error) {
    console.error('Erro durante a remoção de utilizadores:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Ligação ao MongoDB terminada.');
    process.exit(0);
  }
};

clearUsers();
