const TaskModel = require('../models/task');
const logger = require('../config/logger');

function createTask(req, res) {
  try {
    const task = TaskModel.create({ ...req.body, user_id: req.user.id });
    logger.info('Task created', { taskId: task.id, userId: req.user.id });
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    logger.error('Create task error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getTasks(req, res) {
  try {
    const filters = { status: req.query.status, priority: req.query.priority };
    const tasks = req.user.role === 'admin' ? TaskModel.findAll(filters) : TaskModel.findByUser(req.user.id, filters);
    res.json({ tasks, count: tasks.length });
  } catch (err) {
    logger.error('Get tasks error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getTask(req, res) {
  try {
    const task = TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json({ task });
  } catch (err) {
    logger.error('Get task error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function updateTask(req, res) {
  try {
    const task = TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    const updated = TaskModel.update(req.params.id, req.body);
    logger.info('Task updated', { taskId: updated.id });
    res.json({ message: 'Task updated', task: updated });
  } catch (err) {
    logger.error('Update task error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function deleteTask(req, res) {
  try {
    const task = TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    TaskModel.delete(req.params.id);
    logger.info('Task deleted', { taskId: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    logger.error('Delete task error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };