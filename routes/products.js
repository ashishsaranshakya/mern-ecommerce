import express from 'express';
import {getAllProducts, getProduct} from '../controllers/products.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/all', verifyToken, getAllProducts);
router.get('/:id', verifyToken, getProduct);

/* UPDATE */


export default router;