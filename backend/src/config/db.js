const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { startTimeCapsuleWorker } = require('../services/fun/timeCapsuleWorker');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ Ligado com sucesso ao MongoDB Atlas!');
    // Iniciar verificação de cápsulas desbloqueadas no arranque
    startTimeCapsuleWorker();
  } catch (err) {
    logger.error('❌ Erro ao ligar ao MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
