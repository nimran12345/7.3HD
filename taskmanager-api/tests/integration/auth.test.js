process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../../src/app');
const { closeDb } = require('../../src/config/database');

describe('Auth API', () => {
  afterAll(() => { closeDb(); });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'newuser', email: 'newuser@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('user');
    });

    test('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send({ username: 'u2', email: 'dupe@example.com', password: 'password123' });
      const res = await request(app).post('/api/auth/register').send({ username: 'u3', email: 'dupe@example.com', password: 'password123' });
      expect(res.status).toBe(409);
    });

    test('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'u4', email: 'bad-email', password: 'password123' });
      expect(res.status).toBe(400);
    });

    test('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'u5', email: 'u5@example.com', password: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app).post('/api/auth/register').send({ username: 'loginuser', email: 'login@example.com', password: 'correctpassword' });
    });

    test('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'correctpassword' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    test('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'pass' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    beforeAll(async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'profileuser', email: 'profile@example.com', password: 'password123' });
      token = res.body.token;
    });

    test('should return profile with valid token', async () => {
      const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('profile@example.com');
    });

    test('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    test('should reject invalid token', async () => {
      const res = await request(app).get('/api/auth/profile').set('Authorization', 'Bearer badtoken');
      expect(res.status).toBe(403);
    });
  });
});