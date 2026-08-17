const express = require('express');
const authController = require('../controllers/authController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');
const { authRateLimiter } = require('../middleware/rateLimiter.cjs');
const { validate, registerSchema, loginSchema, googleAuthSchema } = require('../middleware/validate.cjs');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/google', authRateLimiter, validate(googleAuthSchema), authController.googleAuth);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
