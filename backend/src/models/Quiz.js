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
    default: 'default_couple'
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

module.exports = mongoose.model('Quiz', quizSchema);
