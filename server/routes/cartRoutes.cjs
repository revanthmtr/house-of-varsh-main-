const express = require('express');
const cartController = require('../controllers/cartController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart', authenticate, cartController.addToCart);
router.delete('/cart/:id', authenticate, cartController.removeFromCart);
router.post('/checkout', authenticate, cartController.checkout);

module.exports = router;
