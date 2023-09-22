import express from 'express';
import { deleteOrder, getOrders, getOrder, updateOrder } from '../../controllers/admin/admin.orders.js';
import { verifyToken } from '../../middleware/admin.auth.js';

const router = express.Router();

router.delete('/', verifyToken, deleteOrder);
router.patch('/', verifyToken, updateOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrder);

export default router;