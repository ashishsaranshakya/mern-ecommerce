import express from 'express';
import {getProducts, getProduct, rateProduct} from '../controllers/products.js';
import {verifyToken, verifyTokenForRating} from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', verifyTokenForRating, getProduct);

router.patch('/:id/rate', verifyToken, rateProduct);

export default router;