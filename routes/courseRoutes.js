import express from 'express';
import { 
  courseEnrollment, 
  createCourseTemplate, 
  createClassGroup, 
  getAllClassGroups, 
  updateCourseTemplate, 
  updateClassGroup, 
  getClassGroupById 
} from '../controllers/courseController.js';
import { authMiddleware as isAuth, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Course enrollment route
router.post('/enrollment', courseEnrollment);

// Course template routes
router.post('/template', isAuth, isAdmin, createCourseTemplate);
router.put('/template/:id', isAuth, isAdmin, updateCourseTemplate);

// Class group routes
router.post('/class-group', isAuth, isAdmin, createClassGroup);
router.get('/class-groups', getAllClassGroups);
router.put('/class-group/:id', isAuth, isAdmin, updateClassGroup);
router.get('/class-group/:id', getClassGroupById);

// Define the route to get course by ID
router.get('/:id', isAuth, getClassGroupById);

export default router;