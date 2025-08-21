// backend/routes/servicios-prisma.js
const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController-prisma');
const verificarToken = require('../middlewares/verificarToken');

// Rutas públicas
router.get('/', servicioController.listar);
router.get('/:id', servicioController.obtenerPorId);

// Rutas protegidas
router.post('/', verificarToken, servicioController.crear);
router.put('/:id', verificarToken, servicioController.actualizar);
router.delete('/:id', verificarToken, servicioController.eliminar);

module.exports = router;
