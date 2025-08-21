// backend/routes/usuarios-prisma.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController-prisma');
const verificarToken = require('../middlewares/verificarToken');

// Rutas públicas
router.post('/registro', usuarioController.registrar);
router.post('/login', usuarioController.login);

// Rutas protegidas
router.get('/perfil', verificarToken, usuarioController.perfil);
router.get('/', verificarToken, usuarioController.listarUsuarios);

module.exports = router;
