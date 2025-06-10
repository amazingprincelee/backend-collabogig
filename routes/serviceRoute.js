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
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/requests', createServiceRequest); // Public or authenticated
router.post('/requests/process', authMiddleware, processServiceRequest); // Admin only
router.post('/:assignmentId/tasks', authMiddleware,  addTask);
router.post('/:assignmentId/milestones', authMiddleware,  addMilestone);
router.post('/:assignmentId/tasks/:taskId/files', authMiddleware, uploadMiddleware.single('file'), uploadFile);
router.post('/:assignmentId/tasks/:taskId/time', authMiddleware,  logTime);
router.post('/:assignmentId/tasks/:taskId/comments', authMiddleware, addComment);
router.get('/dashboard', authMiddleware, getDashboardData);

export default router;