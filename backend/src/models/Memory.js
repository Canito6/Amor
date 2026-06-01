const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
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
  }
});

module.exports = mongoose.model('Memory', memorySchema);
