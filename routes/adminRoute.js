import express from 'express';
import { 
  assignStaffToRequest,
  getCourseManagementData,
  getClassGroupAnalytics,
  togglePrepLinksAccess,
  addPrepLinks,
  getPrepLinks,
  updatePrepLink,
  deletePrepLink
} from '../controllers/adminController.js';
import { authMiddleware as authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import  validate  from '../middlewares/validation.js';
import { prepLinkSchema } from '../validators/validateSchema.js';

const router = express.Router();

// Admin routes
router.post('/assign-staff', authenticateToken, isAdmin, assignStaffToRequest);

// Course management routes
router.get('/course-management', authenticateToken, isAdmin, getCourseManagementData);
router.get('/class-group/:id/analytics', authenticateToken, isAdmin, getClassGroupAnalytics);
router.patch('/user/:userId/toggle-prep-links', authenticateToken, isAdmin, togglePrepLinksAccess);

// Prep links management routes
router.post('/class-group/:classGroupId/prep-links', authenticateToken, isAdmin, validate(prepLinkSchema), addPrepLinks);
router.get('/class-group/:classGroupId/prep-links', authenticateToken, isAdmin, getPrepLinks);
router.put('/class-group/:classGroupId/prep-links/:prepLinkId', authenticateToken, isAdmin, validate(prepLinkSchema), updatePrepLink);
router.delete('/class-group/:classGroupId/prep-links/:prepLinkId', authenticateToken, isAdmin, deletePrepLink);

export default router;