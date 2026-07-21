const mongoose = require('mongoose');

const cycleEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date
  },
  flowIntensity: {
    type: String,
    enum: ['leve', 'moderado', 'intenso', 'muito_intenso', null, ''],
    default: null
  },
  symptoms: {
    type: [String],
    default: []
  },
  mood: {
    type: String,
    default: ''
  },
  sexualActivity: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Validação pré-guardar: endDate >= startDate e datas não podem exceder 1 ano no futuro
cycleEntrySchema.pre('save', function() {
  const now = new Date();
  const maxFuture = new Date();
  maxFuture.setFullYear(now.getFullYear() + 1);

  if (this.startDate && this.startDate > maxFuture) {
    throw new Error('A data de início não pode estar a mais de 1 ano no futuro.');
  }

  if (this.endDate) {
    if (this.endDate > maxFuture) {
      throw new Error('A data de fim não pode estar a mais de 1 ano no futuro.');
    }
    if (this.endDate < this.startDate) {
      throw new Error('A data de fim não pode ser anterior à data de início.');
    }
  }
});

module.exports = mongoose.model('CycleEntry', cycleEntrySchema);
