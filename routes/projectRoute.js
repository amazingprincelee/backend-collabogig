import express from 'express';
import { createProjectFromRequest, getAllProjects, getProjectById } from '../controllers/projectController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, createProjectFromRequest); // Admin only
router.get('/', getAllProjects); // Public access
router.get('/:id', authenticateToken, getProjectById);

export default router;