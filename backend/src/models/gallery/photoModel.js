const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true 
  }, // URL público vindo do Cloudinary
  caption: { 
    type: String,
    maxlength: 1000
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
    required: true
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }
});

photoSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);
