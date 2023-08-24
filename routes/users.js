import express from 'express';
import {patchCart} from '../controllers/users.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

router.patch('/cart', verifyToken, patchCart);

export default router;