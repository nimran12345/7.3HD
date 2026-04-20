const UserModel = require('../models/user');
const { generateToken } = require('../middleware/auth');
const logger = require('../config/logger');

function register(req, res) {
  try {
    const { username, email, password, role } = req.body;
    if (UserModel.findByEmail(email)) return res.status(409).json({ error: 'Email already registered' });
    if (UserModel.findByUsername(username)) return res.status(409).json({ error: 'Username already taken' });
    const user = UserModel.create({ username, email, password, role: role === 'admin' ? 'admin' : 'user' });
    const token = generateToken(user);
    logger.info('User registered', { userId: user.id });
    res.status(201).json({ message: 'User registered successfully', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Registration error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = UserModel.findByEmail(email);
    if (!user || !UserModel.verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    logger.info('User logged in', { userId: user.id });
    res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getProfile(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getProfile };