const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');
const { apiRateLimiter } = require('../middleware/rateLimiter.cjs');

router.post('/create-order', apiRateLimiter, authenticate, paymentController.createOrder);
router.post('/verify', apiRateLimiter, authenticate, paymentController.verifyPayment);

module.exports = router;
