const UserModel = require('../models/user');
const logger = require('../config/logger');

function getAllUsers(req, res) {
  try {
    const users = UserModel.findAll();
    res.json({ users, count: users.length });
  } catch (err) {
    logger.error('Get users error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function deleteUser(req, res) {
  try {
    const user = UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
    UserModel.delete(req.params.id);
    logger.info('User deleted', { deletedId: req.params.id, adminId: req.user.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Delete user error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAllUsers, deleteUser };