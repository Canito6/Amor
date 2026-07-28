const mongoose = require('mongoose');

const openWhenLetterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  conditionType: {
    type: String,
    enum: ['mood', 'date', 'instant'],
    default: 'instant'
  },
  conditionValue: {
    type: String,
    default: ''
  },
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  },
  isOpened: {
    type: Boolean,
    default: false
  },
  openedAt: {
    type: Date
  }
}, {
  timestamps: true
});

openWhenLetterSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('OpenWhenLetter', openWhenLetterSchema);
