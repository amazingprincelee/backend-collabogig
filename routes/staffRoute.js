import express from 'express';
import { createStaff, getAllStaff, getStaffById } from '../controllers/staffController.js';


const router = express.Router();

router.post('/',   createStaff); // Admin only
router.get('/',  getAllStaff); // Admin only
router.get('/:id',  getStaffById);

export default router;