import express from 'express';
import { authMiddleware as isAuth, isAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validation.js';
import { emailTemplateSchema, emailCampaignSchema, testEmailSchema } from '../validators/emailValidators.js';
import {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  createEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  updateEmailCampaign,
  deleteEmailCampaign,
  prepareEmailCampaignRecipients,
  sendTestEmail,
  sendEmailCampaign,
  getEmailCampaignStats
} from '../controllers/emailController.js';

const router = express.Router();

// Email template routes
router.post('/templates', isAuth, isAdmin, validate(emailTemplateSchema), createEmailTemplate);
router.get('/templates', isAuth, isAdmin, getAllEmailTemplates);
router.get('/templates/:id', isAuth, isAdmin, getEmailTemplateById);
router.put('/templates/:id', isAuth, isAdmin, validate(emailTemplateSchema), updateEmailTemplate);
router.delete('/templates/:id', isAuth, isAdmin, deleteEmailTemplate);

// Email campaign routes
router.post('/campaigns', isAuth, isAdmin, validate(emailCampaignSchema), createEmailCampaign);
router.get('/campaigns', isAuth, isAdmin, getAllEmailCampaigns);
router.get('/campaigns/:id', isAuth, isAdmin, getEmailCampaignById);
router.put('/campaigns/:id', isAuth, isAdmin, validate(emailCampaignSchema), updateEmailCampaign);
router.delete('/campaigns/:id', isAuth, isAdmin, deleteEmailCampaign);

// Campaign actions
router.post('/campaigns/:id/prepare', isAuth, isAdmin, prepareEmailCampaignRecipients);
router.post('/campaigns/:id/send', isAuth, isAdmin, sendEmailCampaign);
router.get('/campaigns/:id/stats', isAuth, isAdmin, getEmailCampaignStats);

// Test email
router.post('/test', isAuth, isAdmin, validate(testEmailSchema), sendTestEmail);

export default router;