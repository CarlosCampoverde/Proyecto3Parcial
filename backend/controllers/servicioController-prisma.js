// backend/controllers/servicioController-prisma.js
const { prisma } = require('../database-prisma');

// Crear servicio
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;

    // Validar campos
    if (!nombre || !precio) {
      return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' });
    }

    // Crear servicio
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        usuarioId: req.usuario.id
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Servicio creado exitosamente',
      servicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Listar servicios
exports.listar = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        _count: {
          select: {
            reservas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(servicios);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Obtener servicio por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        reservas: {
          include: {
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

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Actualizar servicio
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    // Verificar que el servicio existe y pertenece al usuario
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id }
    });

    if (!servicioExistente) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    if (servicioExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar este servicio' });
    }

    // Actualizar servicio
    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio && { precio: parseFloat(precio) })
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.json({
      mensaje: 'Servicio actualizado exitosamente',
      servicio: servicioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Eliminar servicio
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el servicio existe y pertenece al usuario
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id }
    });

    if (!servicioExistente) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    if (servicioExistente.usuarioId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este servicio' });
    }

    // Eliminar servicio (las reservas se eliminan en cascada)
    await prisma.servicio.delete({
      where: { id }
    });

    res.json({ mensaje: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
