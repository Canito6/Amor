const mongoose = require('mongoose');

const tabSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    default: '❤️' 
  },
  accentColor: { 
    type: String, 
    default: '#ff4d6d' 
  },
  bgGradient: { 
    type: String, 
    default: 'linear-gradient(135deg, #ffccd5, #ffcad4)' 
  },
  contentType: { 
    type: String, 
    enum: ['notes', 'media', 'link'], 
    default: 'notes' 
  },
  content: { 
    type: String, 
    default: '' 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  coupleId: {
    type: String,
    default: 'default_couple'
  }
}, { timestamps: true });

module.exports = mongoose.model('Tab', tabSchema);
