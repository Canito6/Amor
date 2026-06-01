const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  coupleId: {
    type: String,
    default: 'default_couple'
  }
});

module.exports = mongoose.model('Message', messageSchema);
