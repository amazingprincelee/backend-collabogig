import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/users.js';
import PasswordReset from '../models/passwordReset.js';
import { sendPasswordResetEmail } from '../utils/nodemailer.js';
import { config } from 'dotenv';
config();

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        success: true,
        message: 'If your email is registered, you will receive password reset instructions.'
      });
    }
    
    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set token expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Save token to database
    await PasswordReset.findOneAndDelete({ userId: user._id }); // Remove any existing tokens
    
    const passwordReset = new PasswordReset({
      userId: user._id,
      token,
      expiresAt
    });
    
    await passwordReset.save();
    
    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Continue execution even if email fails - we'll still return success
      // but log the error for debugging
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Password reset instructions have been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
}


// Validate reset token
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    const passwordReset = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() } // Token must not be expired
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    return res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Validate token error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Find valid token
    const passwordReset = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() } // Token must not be expired
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find user
    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Delete the used token
    await PasswordReset.deleteOne({ _id: passwordReset._id });
    
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};