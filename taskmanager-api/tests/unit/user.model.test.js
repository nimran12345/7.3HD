process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const UserModel = require('../../src/models/user');
const { getDb, closeDb } = require('../../src/config/database');

describe('UserModel', () => {
  beforeAll(() => { getDb(); });
  afterAll(() => { closeDb(); });

  let createdUserId;

  test('should create a new user', () => {
    const user = UserModel.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.role).toBe('user');
    createdUserId = user.id;
  });

  test('should find user by id', () => {
    expect(UserModel.findById(createdUserId).username).toBe('testuser');
  });

  test('should find user by email', () => {
    expect(UserModel.findByEmail('test@example.com').username).toBe('testuser');
  });

  test('should find user by username', () => {
    expect(UserModel.findByUsername('testuser').email).toBe('test@example.com');
  });

  test('should return undefined for non-existent user', () => {
    expect(UserModel.findById('fake-id')).toBeUndefined();
  });

  test('should verify correct password', () => {
    const user = UserModel.findByEmail('test@example.com');
    expect(UserModel.verifyPassword('password123', user.password)).toBe(true);
  });

  test('should reject incorrect password', () => {
    const user = UserModel.findByEmail('test@example.com');
    expect(UserModel.verifyPassword('wrongpass', user.password)).toBe(false);
  });

  test('should count users', () => {
    expect(UserModel.count()).toBeGreaterThanOrEqual(1);
  });

  test('should list all users', () => {
    expect(Array.isArray(UserModel.findAll())).toBe(true);
  });

  test('should delete a user', () => {
    const u = UserModel.create({ username: 'todelete', email: 'del@example.com', password: 'pass123' });
    expect(UserModel.delete(u.id)).toBe(true);
    expect(UserModel.findById(u.id)).toBeUndefined();
  });

  test('should create admin user', () => {
    const admin = UserModel.create({ username: 'adminuser', email: 'admin@example.com', password: 'pass', role: 'admin' });
    expect(admin.role).toBe('admin');
  });
});