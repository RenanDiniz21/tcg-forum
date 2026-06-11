function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function publicUser(user) {
  return {
    id: String(user._id),
    nome: user.nome,
    email: user.email
  };
}

function validateRegisterInput({ nome, email, senha }) {
  if (!nome || !email || !senha) {
    throw createHttpError(400, 'Nome, email e senha sao obrigatorios');
  }

  if (senha.length < 6) {
    throw createHttpError(400, 'Senha deve ter pelo menos 6 caracteres');
  }
}

module.exports = {
  createHttpError,
  publicUser,
  validateRegisterInput
};
