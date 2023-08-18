import express from 'express';
import { getUserOrders, getOrder } from '../controllers/orders.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/user', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrder);

/* UPDATE */


export default router;