const express = require('express');
const adminController = require('../controllers/adminController.cjs');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware.cjs');
const { validate, updateOrderStatusSchema } = require('../middleware/validate.cjs');

const router = express.Router();

router.get('/admin/audit-logs', authenticate, requireAdmin, adminController.getAuditLogs);
router.get('/admin/users', authenticate, requireAdmin, adminController.getUsers);
router.get('/admin/orders', authenticate, requireAdmin, adminController.getOrders);
router.patch('/admin/orders/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), adminController.updateOrderStatus);

module.exports = router;
