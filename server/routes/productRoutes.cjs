const express = require('express');
const productController = require('../controllers/productController.cjs');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware.cjs');
const { validate, productSchema } = require('../middleware/validate.cjs');

const router = express.Router();

router.get('/products', productController.getProducts);
router.post('/products', authenticate, requireAdmin, validate(productSchema), productController.createProduct);
router.put('/products/:id', authenticate, requireAdmin, validate(productSchema), productController.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
