const express = require('express');
const orderController = require('../controllers/orderController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.get('/orders', authenticate, orderController.getMyOrders);
router.get('/orders/:id', authenticate, orderController.getMyOrderById);

module.exports = router;
