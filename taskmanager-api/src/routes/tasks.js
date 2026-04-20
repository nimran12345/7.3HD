const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate, taskRules } = require('../middleware/validation');

router.use(authenticate);
router.post('/', taskRules, validate, createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', taskRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;