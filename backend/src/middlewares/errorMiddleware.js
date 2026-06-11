function errorMiddleware(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const erro = Object.values(err.errors).map((item) => item.message).join(', ');
    return res.status(400).json({ erro });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ erro: 'ID invalido' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ erro: 'Email ja cadastrado' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ erro: 'Token invalido ou expirado' });
  }

  return res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
}

module.exports = errorMiddleware;
