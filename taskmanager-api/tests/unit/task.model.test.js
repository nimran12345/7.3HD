process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const TaskModel = require('../../src/models/task');
const UserModel = require('../../src/models/user');
const { getDb, closeDb } = require('../../src/config/database');

describe('TaskModel', () => {
  let testUser, createdTaskId;

  beforeAll(() => {
    getDb();
    testUser = UserModel.create({ username: 'taskowner', email: 'taskowner@example.com', password: 'pass123' });
  });
  afterAll(() => { closeDb(); });

  test('should create a task', () => {
    const task = TaskModel.create({ title: 'Test Task', description: 'desc', user_id: testUser.id });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    createdTaskId = task.id;
  });

  test('should find task by id', () => {
    expect(TaskModel.findById(createdTaskId).title).toBe('Test Task');
  });

  test('should find tasks by user', () => {
    expect(Array.isArray(TaskModel.findByUser(testUser.id))).toBe(true);
  });

  test('should filter tasks by status', () => {
    TaskModel.create({ title: 'Done Task', status: 'completed', user_id: testUser.id });
    const tasks = TaskModel.findByUser(testUser.id, { status: 'completed' });
    expect(tasks.every(t => t.status === 'completed')).toBe(true);
  });

  test('should update a task', () => {
    const updated = TaskModel.update(createdTaskId, { status: 'in_progress', title: 'Updated' });
    expect(updated.status).toBe('in_progress');
    expect(updated.title).toBe('Updated');
  });

  test('should return all tasks (admin view)', () => {
    expect(Array.isArray(TaskModel.findAll())).toBe(true);
  });

  test('should count tasks by status', () => {
    expect(Array.isArray(TaskModel.countByStatus())).toBe(true);
  });

  test('should count total tasks', () => {
    expect(TaskModel.count()).toBeGreaterThanOrEqual(1);
  });

  test('should delete a task', () => {
    const t = TaskModel.create({ title: 'To Delete', user_id: testUser.id });
    expect(TaskModel.delete(t.id)).toBe(true);
    expect(TaskModel.findById(t.id)).toBeUndefined();
  });
});