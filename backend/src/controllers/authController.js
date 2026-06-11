const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createHttpError, publicUser, validateRegisterInput } = require('../utils/authUtils');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.registrar = async (req, res, next) => {
  try {
    validateRegisterInput(req.body);

    const usuario = await User.create(req.body);

    res.status(201).json({
      usuario: publicUser(usuario),
      token: gerarToken(usuario)
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw createHttpError(400, 'Email e senha sao obrigatorios');
    }

    const usuario = await User.findOne({ email: email.toLowerCase().trim() }).select('+senha');

    if (!usuario || !(await usuario.compararSenha(senha))) {
      throw createHttpError(401, 'Credenciais invalidas');
    }

    res.json({
      usuario: publicUser(usuario),
      token: gerarToken(usuario)
    });
  } catch (err) {
    next(err);
  }
};

exports.perfil = async (req, res, next) => {
  try {
    res.json({ usuario: publicUser(req.usuario) });
  } catch (err) {
    next(err);
  }
};
