import express from 'express';
import { generateReport, getAllReports, getReportById } from '../controllers/reportController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, generateReport); // Staff or admin
router.get('/', authenticateToken, getAllReports); // Admin only
router.get('/:id', authenticateToken, getReportById); // Admin or generator

export default router;