const mongoose = require('mongoose');

const dailyCheckInSchema = new mongoose.Schema({
  coupleId: {
    type: String,
    required: true
  },
  date: { // Formato: YYYY-MM-DD
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    answerText: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Garantir que existe apenas um check-in por casal por data
dailyCheckInSchema.index({ coupleId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCheckIn', dailyCheckInSchema);
