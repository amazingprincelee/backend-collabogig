import express from 'express';
import { getAllUsers, getUserById, updateUser, updateProfile } from '../controllers/userController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import uploadMiddleware from '../config/multerConfig.js';

const router = express.Router();

router.get('/', authenticateToken, getAllUsers); // Admin access
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, uploadMiddleware.single('profilePhoto'), updateUser); // Admin or self
router.put('/profile', authenticateToken, uploadMiddleware.single('profilePhoto'), updateProfile); // Self-update

export default router;