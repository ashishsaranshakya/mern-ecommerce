import express from 'express';
import { getUserOrders, getOrder, checkout, paymentVerification } from '../controllers/orders.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/user', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrder);

/* CREATE */
router.post('/checkout', verifyToken, checkout);
router.post('/verify', paymentVerification);

export default router;