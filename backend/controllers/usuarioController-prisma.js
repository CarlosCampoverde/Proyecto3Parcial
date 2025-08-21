// backend/controllers/usuarioController-prisma.js
const { prisma } = require('../database-prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secreto';

// Registrar usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe el email
    const existe = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword
      }
    });

    // Remover password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Login usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre
      },
      secret,
      { expiresIn: '24h' }
    );

    // Remover password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Obtener perfil del usuario
exports.perfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Listar todos los usuarios (para administradores)
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            reservas: true,
            servicios: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
