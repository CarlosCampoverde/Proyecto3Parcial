//Verifica que requiera token
const request = require('supertest');
const app = require('../app');

describe('Reservas API', () => {
  it('debería fallar al crear reserva sin token', async () => {
    const res = await request(app).post('/api/reservas')
      .send({
        servicioId: '123456',
        fecha: '2025-07-15',
        hora: '10:00'
      });
    expect(res.statusCode).toEqual(401); // 
    expect(res.body.mensaje).toBe('Acceso denegado. Token no proporcionado.');
  });
});
