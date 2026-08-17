const express = require('express');
const cartController = require('../controllers/cartController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');
const { validate, addToCartSchema, checkoutSchema } = require('../middleware/validate.cjs');

const router = express.Router();

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart', authenticate, validate(addToCartSchema), cartController.addToCart);
router.delete('/cart/:id', authenticate, cartController.removeFromCart);
router.post('/checkout', authenticate, validate(checkoutSchema), cartController.checkout);

module.exports = router;
