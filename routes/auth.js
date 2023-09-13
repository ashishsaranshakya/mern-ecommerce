import express from 'express';
import { login, register, logout } from '../controllers/auth.js';
import { validateRegisterData, validateLoginData } from '../middleware/authValidator.js';

const router = express.Router();

router.post('/register', validateRegisterData, register);
router.post('/login', validateLoginData, login);
router.post('/logout', logout);

export default router;