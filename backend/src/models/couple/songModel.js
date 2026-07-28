const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  audioUrl: {
    type: String,
    default: ''
  },
  externalUrl: {
    type: String,
    default: ''
  },
  setBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

songSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('DailySong', songSchema);
