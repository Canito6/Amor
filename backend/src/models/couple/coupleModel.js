const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  partner1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  partner2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  names: {
    type: String,
    default: ''
  },
  relationshipDate: {
    type: Date
  }
}, { timestamps: true });

coupleSchema.index({ partner1: 1 });
coupleSchema.index({ partner2: 1 });

module.exports = mongoose.model('Couple', coupleSchema);
