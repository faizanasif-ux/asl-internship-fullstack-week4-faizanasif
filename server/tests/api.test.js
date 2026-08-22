const request = require('supertest');
const app = require('../server');

describe('Auth API Tests', () => {

  test('should fail login with missing email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('should fail login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongemail@test.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('should return 400 when registering without required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
  });

});
