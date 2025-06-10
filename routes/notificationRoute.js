import express from 'express';
import { createNotification, getUserNotifications, markNotificationAsSent } from '../controllers/notificationController.js';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/', authMiddleware, isAdmin, createNotification); // Admin only
router.get('/my', authMiddleware, getUserNotifications); // User-specific
router.put('/:id/sent', authMiddleware, markNotificationAsSent); // User-specific

export default router;