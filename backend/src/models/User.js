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
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
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