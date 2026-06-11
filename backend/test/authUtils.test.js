const test = require('node:test');
const assert = require('node:assert/strict');

const { publicUser, validateRegisterInput, createHttpError } = require('../src/utils/authUtils');

test('publicUser removes password and keeps public identity fields', () => {
  const user = {
    _id: 'abc123',
    nome: 'Ash',
    email: 'ash@kanto.dev',
    senha: 'hash-secreto'
  };

  assert.deepEqual(publicUser(user), {
    id: 'abc123',
    nome: 'Ash',
    email: 'ash@kanto.dev'
  });
});

test('validateRegisterInput rejects weak passwords', () => {
  assert.throws(
    () => validateRegisterInput({ nome: 'Misty', email: 'misty@kanto.dev', senha: '123' }),
    /Senha deve ter pelo menos 6 caracteres/
  );
});

test('createHttpError carries status and user-facing message', () => {
  const err = createHttpError(401, 'Credenciais invalidas');

  assert.equal(err.status, 401);
  assert.equal(err.message, 'Credenciais invalidas');
});
