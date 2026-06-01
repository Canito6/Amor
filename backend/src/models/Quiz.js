const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  coupleId: {
    type: String,
    default: 'default_couple'
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true
      },
      options: [
        {
          type: String,
          required: true
        }
      ],
      creatorAnswer: {
        type: String,
        required: true
      },
      partnerGuess: {
        type: String
      }
    }
  ],
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
