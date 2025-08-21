// backend/database-prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Función para conectar a la base de datos
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}

// Función para desconectar
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('📡 Disconnected from database');
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};
