const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  coupleId: {
    type: String,
    default: 'default_couple'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  reactions: [
    {
      emoji: { type: String, required: true },
      username: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Message', messageSchema);
