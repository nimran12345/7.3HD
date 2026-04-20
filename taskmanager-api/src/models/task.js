const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TaskModel {
  static create({ title, description, status = 'pending', priority = 'medium', due_date, user_id }) {
    const db = getDb();
    const id = uuidv4();
    db.prepare('INSERT INTO tasks (id, title, description, status, priority, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, title, description || null, status, priority, due_date || null, user_id);
    return this.findById(id);
  }

  static findById(id) {
    return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  }

  static findByUser(user_id, filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [user_id];
    if (filters.status) { query += ' AND status = ?'; params.push(filters.status); }
    if (filters.priority) { query += ' AND priority = ?'; params.push(filters.priority); }
    query += ' ORDER BY created_at DESC';
    return db.prepare(query).all(...params);
  }

  static findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT t.*, u.username FROM tasks t JOIN users u ON t.user_id = u.id WHERE 1=1';
    const params = [];
    if (filters.status) { query += ' AND t.status = ?'; params.push(filters.status); }
    query += ' ORDER BY t.created_at DESC';
    return db.prepare(query).all(...params);
  }

  static update(id, updates) {
    const db = getDb();
    const allowed = ['title', 'description', 'status', 'priority', 'due_date'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    if (fields.length === 0) return this.findById(id);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    db.prepare(`UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    return this.findById(id);
  }

  static delete(id) {
    return getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }

  static countByStatus() {
    return getDb().prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
  }

  static count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  }
}

module.exports = TaskModel;