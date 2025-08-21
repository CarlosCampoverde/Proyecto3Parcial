// backend/routes/reservas-prisma.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController-prisma');
const verificarToken = require('../middlewares/verificarToken');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/', reservaController.crear);
router.get('/', reservaController.listar);
router.get('/:id', reservaController.obtenerPorId);
router.put('/:id', reservaController.actualizar);
router.delete('/:id', reservaController.eliminar);

module.exports = router;
