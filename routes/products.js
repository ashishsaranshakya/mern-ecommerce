import express from 'express';
import {getAllProducts, getProduct, searchProducts, rateProduct} from '../controllers/products.js';
import {verifyToken, verifyTokenForRating} from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyTokenForRating, getAllProducts);
router.get('/search', verifyTokenForRating, searchProducts);
router.get('/:id', verifyTokenForRating, getProduct);

router.patch('/:id/rate', verifyToken, rateProduct);

export default router;