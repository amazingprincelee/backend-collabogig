import express from 'express';
import { forgotPassword, validateResetToken, resetPassword } from '../controllers/passwordResetController.js';
import validate from '../middlewares/validation.js';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/passwordResetValidators.js';

const router = express.Router();

// Route for requesting a password reset
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// Route for validating a reset token
router.post('/validate-token', validateResetToken);

// Route for resetting the password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;