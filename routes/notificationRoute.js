import express from 'express';
import { createNotification, getUserNotifications, markNotificationAsSent } from '../controllers/notificationController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { validateNotification } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', authenticateToken, validateNotification, createNotification); // Admin only
router.get('/my', authenticateToken, getUserNotifications); // User-specific
router.put('/:id/sent', authenticateToken, markNotificationAsSent); // User-specific

export default router;