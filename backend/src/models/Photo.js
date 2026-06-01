const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true 
  }, // URL público vindo do Cloudinary
  caption: { 
    type: String 
  },
  uploadedBy: { 
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
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }
});

module.exports = mongoose.model('Photo', photoSchema);
