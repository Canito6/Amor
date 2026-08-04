const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  gameType: {
    type: String,
    required: true,
    default: 'tic-tac-toe'
  },
  players: [{
    username: { type: String, required: true },
    symbol: { type: String, enum: ['X', 'O'], required: true }
  }],
  // O estado do jogo é dinâmico (Mixed) para permitir persistir as variáveis
  // específicas de cada jogo (Jogo do Galo, 4 em Linha, Verdade ou Consequência,
  // Batalha Naval, Wordle) como level, mode, truthsCount, activeCard, history, etc.
  state: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { strict: false });

gameSessionSchema.index({ coupleId: 1, gameType: 1 }, { unique: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
