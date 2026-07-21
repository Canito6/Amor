const mongoose = require('mongoose');

const scratchCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  reward: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdBy: {
    type: String,
    required: true
  },
  coupleId: {
    type: String,
    required: true
  },
  isScratched: {
    type: Boolean,
    default: false
  },
  scratchedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

scratchCardSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('ScratchCard', scratchCardSchema);
