const mongoose = require('mongoose');

const bucketItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedBy: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date
  },
  imageUrl: {
    type: String,
    default: ''
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

module.exports = mongoose.model('BucketItem', bucketItemSchema);
