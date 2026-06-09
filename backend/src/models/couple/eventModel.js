const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['aniversario', 'viagem', 'jantar', 'outro'],
    default: 'outro'
  },
  coupleId: {
    type: String,
    default: 'default_couple'
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
