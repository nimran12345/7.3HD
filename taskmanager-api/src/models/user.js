const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  static create({ username, email, password, role = 'user' }) {
    const db = getDb();
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, username, email, hashedPassword, role);
    return this.findById(id);
  }

  static findById(id) {
    return getDb().prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(id);
  }

  static findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static findByUsername(username) {
    return getDb().prepare('SELECT id, username, email, role FROM users WHERE username = ?').get(username);
  }

  static findAll() {
    return getDb().prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').all();
  }

  static count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM users').get().count;
  }

  static verifyPassword(plain, hashed) {
    return bcrypt.compareSync(plain, hashed);
  }

  static delete(id) {
    return getDb().prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
  }
}

module.exports = UserModel;