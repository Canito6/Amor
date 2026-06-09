const mongoose = require('mongoose');

const likelyQuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: [
    {
      voter: {
        type: String,
        required: true
      },
      votedFor: {
        type: String,
        required: true
      }
    }
  ],
  isMatched: {
    type: Boolean,
    default: false
  },
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LikelyQuestion', likelyQuestionSchema);
