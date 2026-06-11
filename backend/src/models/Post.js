const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    texto: {
      type: String,
      required: [true, 'Comentario nao pode ficar vazio'],
      trim: true,
      maxlength: [500, 'Comentario deve ter no maximo 500 caracteres']
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const reactionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['like', 'fire', 'spark'],
      required: true
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Titulo e obrigatorio'],
      trim: true,
      minlength: [3, 'Titulo deve ter pelo menos 3 caracteres'],
      maxlength: [120, 'Titulo deve ter no maximo 120 caracteres']
    },
    conteudo: {
      type: String,
      required: [true, 'Conteudo e obrigatorio'],
      trim: true,
      minlength: [5, 'Conteudo deve ter pelo menos 5 caracteres'],
      maxlength: [2000, 'Conteudo deve ter no maximo 2000 caracteres']
    },
    tag: {
      type: String,
      enum: ['deck', 'troca', 'duvida', 'torneio', 'colecao'],
      default: 'duvida'
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comentarios: [commentSchema],
    reacoes: [reactionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
