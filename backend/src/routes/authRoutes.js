const express = require('express');
const authController = require('../controllers/authController');
const proteger = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.get('/perfil', proteger, authController.perfil);

module.exports = router;
