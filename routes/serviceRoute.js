import express from 'express';
import {
  addTask,
  addMilestone,
  uploadFile,
  uploadMiddleware,
  logTime,
  addComment,
  getDashboardData,
  createServiceRequest,
  processServiceRequest,
} from '../controllers/serviceController.js';
import {
  validateTask,
  validateMilestone,
  validateTime,
  validateServiceRequest,
} from '../middlewares/validation.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/requests', validateServiceRequest, createServiceRequest); // Public or authenticated
router.post('/requests/process', authenticateToken, processServiceRequest); // Admin only
router.post('/:assignmentId/tasks', authenticateToken, validateTask, addTask);
router.post('/:assignmentId/milestones', authenticateToken, validateMilestone, addMilestone);
router.post('/:assignmentId/tasks/:taskId/files', authenticateToken, uploadMiddleware.single('file'), uploadFile);
router.post('/:assignmentId/tasks/:taskId/time', authenticateToken, validateTime, logTime);
router.post('/:assignmentId/tasks/:taskId/comments', authenticateToken, addComment);
router.get('/dashboard', authenticateToken, getDashboardData);

export default router;