const mongoose = require('mongoose');

const tabSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  icon: { 
    type: String, 
    default: '❤️',
    maxlength: 20
  },
  accentColor: { 
    type: String, 
    default: '#ff4d6d',
    maxlength: 50
  },
  bgGradient: { 
    type: String, 
    default: 'linear-gradient(135deg, #ffccd5, #ffcad4)',
    maxlength: 200
  },
  contentType: { 
    type: String, 
    enum: ['notes', 'media', 'link'], 
    default: 'notes' 
  },
  content: { 
    type: String, 
    default: '',
    maxlength: 20000
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
