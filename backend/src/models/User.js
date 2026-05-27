const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Garante que não há nomes repetidos
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Cria automaticamente a data em que a conta foi criada

// Segurança: Antes de guardar o utilizador na base de dados, encripta a password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Ferramenta: Compara a password que escreveram no login com a que está encriptada
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);