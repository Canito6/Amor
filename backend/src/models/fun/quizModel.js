const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  createdBy: {
    type: String,
    required: true
  },
  coupleId: {
    type: String,
    required: true
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
        maxlength: 500
      },
      options: [
        {
          type: String,
          required: true,
          maxlength: 200
        }
      ],
      creatorAnswer: {
        type: String,
        required: true,
        maxlength: 200
      },
      partnerGuess: {
        type: String,
        maxlength: 200
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

quizSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
