import express from 'express';
import { createProduct, deleteProduct, updateProduct, getProducts, getProduct } from '../../controllers/admin/admin.products.js';
import { validateProductData } from '../../middleware/admin.productVadidator.js';
import { verifyToken } from '../../middleware/admin.auth.js';

const router = express.Router();

router.post('/', [verifyToken, validateProductData], createProduct);
router.delete('/', verifyToken, deleteProduct);
router.put('/', [verifyToken, validateProductData], updateProduct);
router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProduct);

export default router;