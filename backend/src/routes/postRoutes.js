const express = require('express');
const postController = require('../controllers/postController');
const proteger = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', postController.listar);
router.get('/:id', postController.buscarPorId);
router.post('/', proteger, postController.criar);
router.put('/:id', proteger, postController.atualizar);
router.delete('/:id', proteger, postController.remover);
router.post('/:id/comentarios', proteger, postController.comentar);
router.post('/:id/reacoes', proteger, postController.reagir);

module.exports = router;
