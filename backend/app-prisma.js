// backend/app-prisma.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión de Prisma
const { connectDatabase } = require('./database-prisma');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDatabase();

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
app.use('/api/usuarios', require('./routes/usuarios-prisma'));
app.use('/api/servicios', require('./routes/servicios-prisma'));
app.use('/api/reservas', require('./routes/reservas-prisma'));

module.exports = app;
