const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./database');

const app = express();
app.use(cors());
app.use(express.json());

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
    database: 'MongoDB + Mongoose',
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
        perfil: 'GET /api/usuarios/perfil (auth required)'
      },
      servicios: {
        listar: 'GET /api/servicios',
        crear: 'POST /api/servicios (auth required)'
      },
      reservas: {
        listar: 'GET /api/reservas (auth required)',
        crear: 'POST /api/reservas (auth required)'
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
    service: 'ProyectoP2Preubas API'
  });
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));

module.exports = app;  // 👈 exportamos la app sin levantar el servidor
