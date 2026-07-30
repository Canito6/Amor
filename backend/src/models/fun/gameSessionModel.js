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
  state: {
    board: {
      type: [String],
      default: () => Array(9).fill(null)
    },
    currentTurn: {
      type: String,
      enum: ['X', 'O'],
      default: 'X'
    },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'finished'],
      default: 'waiting'
    },
    winner: {
      type: String,
      default: null // 'X', 'O', 'draw' ou null
    },
    winningLine: {
      type: [Number],
      default: null
    },
    scores: {
      X: { type: Number, default: 0 },
      O: { type: Number, default: 0 },
      draws: { type: Number, default: 0 }
    },
    lastStarter: {
      type: String,
      enum: ['X', 'O'],
      default: 'X'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

gameSessionSchema.index({ coupleId: 1, gameType: 1 }, { unique: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
