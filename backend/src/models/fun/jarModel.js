const mongoose = require('mongoose');

const jarNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['miminho', 'piada', 'recordacao'],
    default: 'miminho'
  },
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

jarNoteSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('JarNote', jarNoteSchema);
