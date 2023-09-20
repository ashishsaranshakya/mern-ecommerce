import express from 'express';
import { login, register, logout, deleteAdmin } from '../../controllers/admin/admin.auth.js';
import { getProfile, listAdmin } from '../../controllers/admin/admin.js';
import { validateRegisterData, validateLoginData } from '../../middleware/admin.authValidator.js';
import { verifyToken } from '../../middleware/admin.auth.js';
import productRouter from './admin.products.js';
import orderRouter from './admin.orders.js';
import userRouter from './admin.users.js';

const router = express.Router();

router.post('/register', validateRegisterData, verifyToken, register);
router.delete('/delete', verifyToken, deleteAdmin);
router.post('/login', validateLoginData, login);
router.post('/logout', verifyToken, logout);

router.get('/list', verifyToken, listAdmin);
router.get('/profile', verifyToken, getProfile);

router.use('/product', productRouter);
router.use('/order', orderRouter);
router.use('/user', userRouter);

export default router;