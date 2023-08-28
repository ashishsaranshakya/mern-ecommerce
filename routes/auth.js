import express from 'express';
import { login, register, logout } from '../controllers/auth.js';
import { validateRegisterData } from '../middleware/registerValidation.js';

const router = express.Router();

router.post('/register', validateRegisterData, register);
router.post('/login', login);
router.post('/logout', logout);

export default router;