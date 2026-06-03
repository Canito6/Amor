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
    type: String,
    default: 'default_couple'
  },
  loginSecurityMethod: {
    type: String,
    enum: ['direct', 'email', 'mobile'],
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