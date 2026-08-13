const express = require('express');
const authController = require('../controllers/authController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');
const { authRateLimiter } = require('../middleware/rateLimiter.cjs');

const router = express.Router();

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/google', authRateLimiter, authController.googleAuth);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
