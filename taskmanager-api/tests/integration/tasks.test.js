process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../../src/app');
const { closeDb } = require('../../src/config/database');

describe('Tasks API', () => {
  let userToken, adminToken, taskId;

  beforeAll(async () => {
    const u = await request(app).post('/api/auth/register').send({ username: 'taskuser', email: 'taskuser@example.com', password: 'password123' });
    userToken = u.body.token;
    const a = await request(app).post('/api/auth/register').send({ username: 'taskadmin', email: 'taskadmin@example.com', password: 'password123', role: 'admin' });
    adminToken = a.body.token;
  });
  afterAll(() => { closeDb(); });

  test('should create a task', async () => {
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${userToken}`).send({ title: 'My Task', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.task.priority).toBe('high');
    taskId = res.body.task.id;
  });

  test('should reject task without title', async () => {
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${userToken}`).send({ description: 'no title' });
    expect(res.status).toBe(400);
  });

  test('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Unauth' });
    expect(res.status).toBe(401);
  });

  test('should return user tasks', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  test('should allow admin to see all tasks', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('should filter tasks by status', async () => {
    const res = await request(app).get('/api/tasks?status=pending').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    res.body.tasks.forEach(t => expect(t.status).toBe('pending'));
  });

  test('should get a specific task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe(taskId);
  });

  test('should return 404 for non-existent task', async () => {
    const res = await request(app).get('/api/tasks/fake-id').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  test('should update a task', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${userToken}`).send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('in_progress');
  });

  test('should delete a task', async () => {
    const c = await request(app).post('/api/tasks').set('Authorization', `Bearer ${userToken}`).send({ title: 'To Delete' });
    const res = await request(app).delete(`/api/tasks/${c.body.task.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});