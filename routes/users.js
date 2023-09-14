import express from 'express';
import {getCart, getProfile, addToCart, deleteFromCart} from '../controllers/users.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

router.get('/cart', verifyToken, getCart);
router.get('/profile', verifyToken, getProfile);

router.post('/cart', verifyToken, addToCart);
router.delete('/cart', verifyToken, deleteFromCart);

export default router;