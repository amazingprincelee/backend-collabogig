import express from 'express';
import { createProjectFromRequest, getAllProjects, getProjectById } from '../controllers/projectController.js';


const router = express.Router();

router.post('/', createProjectFromRequest); // Admin only
router.get('/', getAllProjects); // Public access
router.get('/:id', getProjectById);

export default router;