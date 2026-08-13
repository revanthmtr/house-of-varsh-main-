const express = require('express');
const contentController = require('../controllers/contentController.cjs');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.get('/content', contentController.getContent);
router.put('/content/:section/:key', authenticate, requireAdmin, contentController.updateContent);
router.patch('/content/:section/bulk', authenticate, requireAdmin, contentController.bulkUpdateContent);

module.exports = router;
