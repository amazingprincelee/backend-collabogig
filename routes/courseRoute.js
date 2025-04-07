import express from 'express';
import { createCourse, getAllCourses, enrollInCourse } from '../controllers/courseController.js';
import { validateCourse } from '../middlewares/validation.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, validateCourse, createCourse); // Admin only
router.get('/', getAllCourses); // Public access
router.post('/:id/enroll', authenticateToken, enrollInCourse); // Authenticated users

export default router;