require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const metricsMiddleware = require('./middleware/metricsMiddleware');
const { register, tasksByStatus, activeUsers } = require('./config/metrics');
const { getDb } = require('./config/database');
const TaskModel = require('./models/task');
const UserModel = require('./models/user');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } }));
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  try {
    getDb();
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime(), version: '1.0.0' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    const statusCounts = TaskModel.countByStatus();
    ['pending', 'in_progress', 'completed', 'cancelled'].forEach(s => tasksByStatus.set({ status: s }, 0));
    statusCounts.forEach(({ status, count }) => tasksByStatus.set({ status }, count));
    activeUsers.set(UserModel.count());
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;