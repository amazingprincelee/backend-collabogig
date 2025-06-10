import express from 'express';
import { createPayment, verifyPayment, paymentCallback } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createPayment); // No authMiddleware for new users
router.post('/verify', authMiddleware, verifyPayment);
router.get('/callback', paymentCallback); // New callback route

export default router;