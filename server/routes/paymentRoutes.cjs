const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.cjs');
const { optionalAuth } = require('../middleware/authMiddleware.cjs');
const { apiRateLimiter } = require('../middleware/rateLimiter.cjs');

router.post('/create-order', apiRateLimiter, optionalAuth, paymentController.createOrder);
router.post('/verify', apiRateLimiter, optionalAuth, paymentController.verifyPayment);

module.exports = router;

