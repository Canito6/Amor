const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
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
  createdBy: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  coupleId: {
    type: String,
    required: true
  },
  isTimeCapsule: {
    type: Boolean,
    default: false
  },
  unlockDate: {
    type: Date
  },
  notified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Memory', memorySchema);
