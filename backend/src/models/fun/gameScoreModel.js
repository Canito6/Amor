const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['tic-tac-toe', 'memory', 'quiz', 'likely', 'scratch_card', 'custom']
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

gameScoreSchema.index({ coupleId: 1, username: 1, gameType: 1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);
