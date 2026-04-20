process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../../src/app');
const { closeDb } = require('../../src/config/database');

describe('Health & Metrics', () => {
  afterAll(() => { closeDb(); });

  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.uptime).toBeDefined();
  });

  test('GET /metrics returns Prometheus data', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('active_users_total');
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/doesnotexist');
    expect(res.status).toBe(404);
  });
});