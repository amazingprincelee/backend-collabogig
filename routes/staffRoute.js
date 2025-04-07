import express from 'express';
import { createStaff, getAllStaff, getStaffById } from '../controllers/staffController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { validateStaff } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', authenticateToken, validateStaff, createStaff); // Admin only
router.get('/', authenticateToken, getAllStaff); // Admin only
router.get('/:id', authenticateToken, getStaffById);

export default router;