const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: { 
    type: String, 
    default: 'user' 
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  precisaMudarPassword: { 
    type: Boolean,
    default: false
  },
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  },
  coupleId: {
    type: String
  },
  loginSecurityMethod: {
    type: String,
    enum: ['direct', 'email'],
    default: 'direct'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  trustedDevices: [{
    deviceToken: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  }],
  loginVerificationCode: {
    type: String
  },
  loginVerificationExpires: {
    type: Date
  },
  // [SEGURANÇA - VULN-001] Rastreio de tentativas incorretas para evitar brute-force
  loginVerificationAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  // [SEGURANÇA - VULN-001] Rastreio de tentativas de código de recuperação
  resetPasswordAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  moodEmoji: {
    type: String,
    default: ''
  },
  moodUpdatedAt: {
    type: Date,
    default: Date.now
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  moodHistory: [{
    emoji: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  dashboardWidgets: {
    type: [Object],
    default: undefined
  },
  cycleTracking: {
    gender: {
      type: String,
      enum: ['homem', 'mulher', 'nao_especificado'],
      default: 'nao_especificado'
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    shareWithPartner: {
      type: Boolean,
      default: false
    },
    partnerShareLevel: {
      type: String,
      enum: ['none', 'basic', 'detailed'],
      default: 'basic'
    },
    hiddenFromMenu: {
      type: Boolean,
      default: false
    },
    remindersEnabled: {
      type: Boolean,
      default: true
    }
  }
});

// MAGIA DE SEGURANÇA (Sem o problemático "next")
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // Se a password não mudou, sai daqui e continua a gravar
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// MAGIA DO LOGIN
userSchema.methods.comparePassword = async function(passwordEscrita) {
  return await bcrypt.compare(passwordEscrita, this.password);
};

module.exports = mongoose.model('User', userSchema);