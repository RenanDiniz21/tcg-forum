const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome e obrigatorio'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres']
    },
    email: {
      type: String,
      required: [true, 'Email e obrigatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalido']
    },
    senha: {
      type: String,
      required: [true, 'Senha e obrigatoria'],
      minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
      select: false
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('senha')) return next();

  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

userSchema.methods.compararSenha = function compararSenha(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema);
