import express from 'express';
import { deleteUser, getUser, getUsers } from '../../controllers/admin/admin.users.js';
import { verifyToken } from '../../middleware/admin.auth.js';

const router = express.Router();

router.delete('/', verifyToken, deleteUser);
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUser);

export default router;