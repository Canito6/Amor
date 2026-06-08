const mongoose = require('mongoose');

const decisionWheelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayMinSize, 'A roleta deve ter pelo menos 2 opções.']
  },
  createdBy: {
    type: String,
    required: true
  },
  coupleId: {
    type: String,
    default: 'default_couple',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayMinSize(val) {
  return val && val.length >= 2;
}

module.exports = mongoose.model('DecisionWheel', decisionWheelSchema);
