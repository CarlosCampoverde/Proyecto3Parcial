// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar la conexión de Prisma
const { connectDatabase } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDatabase();

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz - servir login.html como página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// Rutas específicas del frontend
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'registro.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html'));
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'ProyectoP2Preubas API',
    version: '1.0.0',
    description: 'Sistema de gestión de reservas de gimnasio',
    database: 'PostgreSQL + Prisma',
    frontend: 'Served from /frontend folder',
    pages: {
      home: '/',
      login: '/login', 
      registro: '/registro',
      dashboard: '/dashboard'
    },
    endpoints: {
      health: '/api/health',
      usuarios: {
        registro: 'POST /api/usuarios/registro',
        login: 'POST /api/usuarios/login',
        perfil: 'GET /api/usuarios/perfil (auth required)',
        listar: 'GET /api/usuarios (auth required)'
      },
      servicios: {
        listar: 'GET /api/servicios',
        obtener: 'GET /api/servicios/:id',
        crear: 'POST /api/servicios (auth required)',
        actualizar: 'PUT /api/servicios/:id (auth required)',
        eliminar: 'DELETE /api/servicios/:id (auth required)'
      },
      reservas: {
        listar: 'GET /api/reservas (auth required)',
        crear: 'POST /api/reservas (auth required)',
        obtener: 'GET /api/reservas/:id (auth required)',
        actualizar: 'PUT /api/reservas/:id (auth required)',
        eliminar: 'DELETE /api/reservas/:id (auth required)'
      }
    },
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for k6 tests
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ProyectoP2Preubas API',
    database: 'PostgreSQL + Prisma'
  });
});

// Rutas con controladores Prisma
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));

module.exports = app;
