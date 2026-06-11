const Post = require('../models/Post');
const { createHttpError } = require('../utils/authUtils');

const populatePost = [
  { path: 'autor', select: 'nome email' },
  { path: 'comentarios.autor', select: 'nome email' },
  { path: 'reacoes.usuario', select: 'nome email' }
];

function assertOwner(post, usuarioId) {
  if (String(post.autor._id || post.autor) !== String(usuarioId)) {
    throw createHttpError(403, 'Voce so pode alterar suas postagens');
  }
}

exports.listar = async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate(populatePost);

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

exports.buscarPorId = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(populatePost);

    if (!post) {
      throw createHttpError(404, 'Postagem nao encontrada');
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const post = await Post.create({
      titulo: req.body.titulo,
      conteudo: req.body.conteudo,
      tag: req.body.tag,
      autor: req.usuario._id
    });

    const postCompleto = await Post.findById(post._id).populate(populatePost);
    res.status(201).json(postCompleto);
  } catch (err) {
    next(err);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw createHttpError(404, 'Postagem nao encontrada');
    }

    assertOwner(post, req.usuario._id);

    const atualizado = await Post.findByIdAndUpdate(
      req.params.id,
      {
        titulo: req.body.titulo,
        conteudo: req.body.conteudo,
        tag: req.body.tag
      },
      { new: true, runValidators: true }
    ).populate(populatePost);

    res.json(atualizado);
  } catch (err) {
    next(err);
  }
};

exports.remover = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw createHttpError(404, 'Postagem nao encontrada');
    }

    assertOwner(post, req.usuario._id);
    await post.deleteOne();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.comentar = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw createHttpError(404, 'Postagem nao encontrada');
    }

    post.comentarios.push({
      texto: req.body.texto,
      autor: req.usuario._id
    });

    await post.save();

    const postCompleto = await Post.findById(post._id).populate(populatePost);
    res.status(201).json(postCompleto);
  } catch (err) {
    next(err);
  }
};

exports.reagir = async (req, res, next) => {
  try {
    const tipo = req.body.tipo || 'like';
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw createHttpError(404, 'Postagem nao encontrada');
    }

    const reacaoExistente = post.reacoes.find((reacao) => {
      return String(reacao.usuario) === String(req.usuario._id) && reacao.tipo === tipo;
    });

    if (reacaoExistente) {
      post.reacoes.pull(reacaoExistente._id);
    } else {
      post.reacoes.push({ tipo, usuario: req.usuario._id });
    }

    await post.save();

    const postCompleto = await Post.findById(post._id).populate(populatePost);
    res.json(postCompleto);
  } catch (err) {
    next(err);
  }
};
