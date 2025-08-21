const express = require('express');
const router = express.Router();
const controller = require('../controllers/servicioController');

router.get('/', controller.obtenerServicios);
router.post('/', controller.crearServicio);
router.delete('/:id', controller.eliminarServicio);  

module.exports = router;
