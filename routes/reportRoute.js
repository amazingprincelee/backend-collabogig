import express from 'express';
import { generateReport, getAllReports, getReportById } from '../controllers/reportController.js';


const router = express.Router();

router.post('/', generateReport); // Staff or admin
router.get('/', getAllReports); // Admin only
router.get('/:id', getReportById); // Admin or generator

export default router;