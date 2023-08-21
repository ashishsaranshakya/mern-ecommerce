import express from 'express';
import {login, validateRegister, register, logout} from '../controllers/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/logout', logout);

export default router;