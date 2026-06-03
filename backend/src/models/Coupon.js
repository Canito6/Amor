const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
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
  icon: {
    type: String,
    default: '🎟️'
  },
  coupleId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['gifted', 'redeemed'],
    default: 'gifted'
  },
  redeemedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
