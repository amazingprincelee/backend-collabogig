import express from 'express';
import {createPartner, updatePartnerPercentages, getPartnerDetails} from '../controllers/partnersController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.js';
import {updatePartnerSchema, appDevProjectSchema, partnerSchema} from '../validators/validateSchema.js'

const router = express.Router();


router.post('/partner', validate(partnerSchema), createPartner); // Create a new partner
router.put('/partner/percentages', validate(updatePartnerSchema), updatePartnerPercentages); // Update partner percentages (admin only)
router.get('/partner/:partnerId', getPartnerDetails); 


export default router;