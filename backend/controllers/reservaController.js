const Reserva = require('../models/Reserva');
const jwt = require('jsonwebtoken');

exports.crearReserva = async (req, res) => {
  try {
    const { servicio, fecha, hora } = req.body;
    
    // Validar campos requeridos
    if (!servicio || !fecha || !hora) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ mensaje: 'El formato de fecha debe ser YYYY-MM-DD' });
    }

    // Validar que la fecha no sea en el pasado
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaReserva < hoy) {
      return res.status(400).json({ mensaje: 'No se pueden hacer reservas para fechas pasadas' });
    }

    // Validar formato de hora (HH:mm)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
      return res.status(400).json({ mensaje: 'El formato de hora debe ser HH:mm' });
    }

    // Validar horario de atención (8:00 a 20:00)
    const horaNum = parseInt(hora.split(':')[0]);
    if (horaNum < 8 || horaNum >= 20) {
      return res.status(400).json({ mensaje: 'El horario de atención es de 8:00 a 20:00' });
    }

    // Verificar si ya existe una reserva para la misma fecha y hora
    const reservaExistente = await Reserva.findOne({ fecha, hora });
    if (reservaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una reserva para esta fecha y hora' });
    }

    const reserva = new Reserva({
      usuario: req.usuario.id || req.usuario._id, // Aceptar ambos formatos
      servicio,
      fecha,
      hora
    });
    
    const reservaGuardada = await reserva.save();
    const reservaCompleta = await Reserva.findById(reservaGuardada._id)
      .populate('servicio')
      .populate('usuario', 'nombre email');
    res.status(201).json(reservaCompleta);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerReservasUsuario = async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario.id }).populate('servicio');
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.eliminarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    if (reserva.usuario.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No autorizado para eliminar esta reserva' });
    }

    await Reserva.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
