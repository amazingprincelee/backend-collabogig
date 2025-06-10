import express from 'express';
import { getAllUsers, getUserById, updateUser, updateProfile, getUser, changePassword } from '../controllers/userController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/user', authMiddleware, getUser);
router.get('/', authMiddleware, isAdmin, getAllUsers); // Admin access
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, isAdmin,  updateUser); // Admin or self
router.put('/profile', authMiddleware,  updateProfile); // Self-update
router.put('/change-password', authMiddleware, changePassword);

export default router;