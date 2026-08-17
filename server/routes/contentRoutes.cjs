const express = require('express');
const contentController = require('../controllers/contentController.cjs');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware.cjs');
const { validate, updateContentSchema, bulkUpdateContentSchema } = require('../middleware/validate.cjs');

const router = express.Router();

router.get('/content', contentController.getContent);
router.put('/content/:section/:key', authenticate, requireAdmin, validate(updateContentSchema), contentController.updateContent);
router.patch('/content/:section/bulk', authenticate, requireAdmin, validate(bulkUpdateContentSchema), contentController.bulkUpdateContent);

module.exports = router;
