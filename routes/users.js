import express from 'express';
import {addToCart, deleteFromCart} from '../controllers/users.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

router.post('/cart', verifyToken, addToCart);
router.delete('/cart', verifyToken, deleteFromCart);

export default router;