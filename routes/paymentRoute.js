import express from 'express';
import { createPayment, verifyPayment, getUserPayments } from '../controllers/paymentController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { validatePayment } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', authenticateToken, validatePayment, createPayment);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/my', authenticateToken, getUserPayments);

export default router;