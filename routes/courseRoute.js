import express from 'express';
import { createCourseTemplate, getAllClassGroups, courseEnrollment, createClassGroup, updateClassGroup, updateCourseTemplate } from '../controllers/courseController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.js';
import { createClassGroupSchema } from '../validators/validateSchema.js'


const router = express.Router();

router.get('/', getAllClassGroups);
router.post('/create-template', authMiddleware, isAdmin, createCourseTemplate); 
router.post('/class-group', authMiddleware, isAdmin, validate( createClassGroupSchema ),createClassGroup); 
router.post('/enroll',  courseEnrollment);
router.put('/update-template/:id', authMiddleware, isAdmin, updateCourseTemplate);
router.put('/update-class-group/:id', authMiddleware, isAdmin, updateClassGroup);

export default router;






