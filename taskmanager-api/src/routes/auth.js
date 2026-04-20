const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validation');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;