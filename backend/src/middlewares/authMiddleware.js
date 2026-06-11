const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/authUtils');

const proteger = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw createHttpError(401, 'Token nao informado');
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const usuario = await User.findById(payload.id);

  if (!usuario) {
    throw createHttpError(401, 'Usuario nao encontrado');
  }

  req.usuario = usuario;
  next();
});

module.exports = proteger;
