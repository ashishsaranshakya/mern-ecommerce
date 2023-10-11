import express from 'express';
import { getUserOrders, getOrder, checkoutProduct, checkoutCart, checkoutOrder, paymentVerification } from '../controllers/orders.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrder);

router.post('/checkout/product', verifyToken, checkoutProduct);
router.post('/checkout/cart', verifyToken, checkoutCart);
router.post('/checkout/order', verifyToken, checkoutOrder);
router.post('/verify', paymentVerification);

export default router;