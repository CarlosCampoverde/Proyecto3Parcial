// backend/controllers/reservaController-prisma.js
const { prisma } = require('../database-prisma');

// Crear reserva
exports.crear = async (req, res) => {
  try {
    const { servicioId, fechaInicio, fechaFin } = req.body;

    // Validar campos
    if (!servicioId || !fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: 'ServicioId, fechaInicio y fechaFin son obligatorios' });
    }

    // Verificar que el servicio existe
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId }
    });

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    // Verificar que las fechas son válidas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio >= fin) {
      return res.status(400).json({ mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin' });
    }

    if (inicio < new Date()) {
      return res.status(400).json({ mensaje: 'La fecha de inicio no puede ser en el pasado' });
    }

    // Verificar disponibilidad (no solapamiento)
    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        servicioId,
        estado: {
          not: 'CANCELADA'
        },
        OR: [
          {
            AND: [
              { fechaInicio: { lte: inicio } },
              { fechaFin: { gt: inicio } }
            ]
          },
          {
            AND: [
              { fechaInicio: { lt: fin } },
              { fechaFin: { gte: fin } }
            ]
          },
          {
            AND: [
              { fechaInicio: { gte: inicio } },
              { fechaFin: { lte: fin } }
            ]
          }
        ]
      }
    });

    if (reservaExistente) {
      return res.status(409).json({ mensaje: 'El servicio no está disponible en esas fechas' });
    }

    // Crear reserva
    const reserva = await prisma.reserva.create({
      data: {
        usuarioId: req.usuario.id,
        servicioId,
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'PENDIENTE'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        servicio: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Listar reservas del usuario
exports.listar = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      where: {
        usuarioId: req.usuario.id
      },
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });

    res.json(reservas);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Obtener reserva por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        servicio: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    // Verificar que la reserva pertenece al usuario
    if (reserva.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para ver esta reserva' });
    }

    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Actualizar estado de reserva
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: 'Estado inválido. Debe ser: PENDIENTE, CONFIRMADA, CANCELADA o COMPLETADA' 
      });
    }

    // Verificar que la reserva existe y pertenece al usuario
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id }
    });

    if (!reservaExistente) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    if (reservaExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar esta reserva' });
    }

    // Actualizar reserva
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: { estado },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        servicio: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true
          }
        }
      }
    });

    res.json({
      mensaje: 'Reserva actualizada exitosamente',
      reserva: reservaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Eliminar reserva
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la reserva existe y pertenece al usuario
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id }
    });

    if (!reservaExistente) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    if (reservaExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar esta reserva' });
    }

    // Eliminar reserva
    await prisma.reserva.delete({
      where: { id }
    });

    res.json({ mensaje: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
