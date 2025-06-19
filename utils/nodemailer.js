import { config } from 'dotenv';
import nodemailer from 'nodemailer';

config();

// Create transporter with cPanel SMTP settings
const transporter = nodemailer.createTransport({
  host: 'collabogig.com', // cPanel SMTP host
  port: 465, // Use port 465 for SSL
  secure: true, // Set to true for port 465 (SSL)
  auth: {
    user: process.env.NODE_MAIL_USER, // e.g., no-reply@collabogig.com
    pass: process.env.NODE_MAIL_PWDS, // Email account password
  },
  tls: {
    rejectUnauthorized: true, // Enforce valid certificates
    minVersion: 'TLSv1.2', // Require TLS 1.2 or higher
  },
});

// Verify SMTP configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP configuration error:');
    console.error(error);
  } else {
    console.log('SMTP configuration is correct. Server is ready to take our messages.');
  }
});

// Helper function to format date in a readable format
const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Function to send verification email
export const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig Verification Code',
    text: `Dear User,\n\nYour verification code is: ${code}\n\nThank you for choosing Collabogig Innovations.\n\nBest regards,\nCollabogig Innovations Team`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendWelcomeWithTempPassword = async (to, name, courseTitle, tempPassword) => {
  const mailOptions = {
    from: 'code-fast@collabogig.com',
    to,
    subject: 'Welcome to Code-Fast with Prince Lee - Your Course Access',
    text: `Dear ${name},

Thank you for enrolling in Code-Fast with Prince Lee, Powered by collabogig.com!

You are now registered for the "${courseTitle}" course. To get started, please use the following temporary password to log in:

Temporary Password: ${tempPassword}

Please visit https://codefast.collabogig.com to log in and change your password immediately after your first login for security purposes.

You can join our whatsapp group for support and discussion: https://chat.whatsapp.com/KXDvG1OCChC3b33WkTTD0J

We are excited to have you join us on this learning journey. Should you need assistance, feel free to reply to this email.

Best regards,  
Prince Lee  
Lead Instructor, Code-Fast  
codefast.collabogig.com`,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send notification email
export const sendNotificationEmail = async (to, message) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig Notification',
    text: `Dear User,\n\n${message}\n\nBest regards,\nCollabogig Innovations Team`,
  };
  return transporter.sendMail(mailOptions);
};

// Function to send temporary password
export const sendTemporaryPassword = async (to, tempPassword) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig Temporary Password Reset',
    text: `Dear User,\n\nYour temporary password is: ${tempPassword}\n\nPlease log in using this password and change it immediately.\n\nBest regards,\nCollabogig Innovations Team`,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send course start reminder
export const sendCourseStartReminder = async (user, classGroup, courseTemplate) => {
  const mailOptions = {
    from: 'code-fast@collabogig.com',
    to: user.email,
    subject: `Reminder: Your ${courseTemplate.title} Course Starts Today!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6ee0;">Your Course Starts Today!</h2>
        </div>
        
        <p>Dear ${user.name},</p>
        
        <p>We're excited to remind you that your <strong>${courseTemplate.title}</strong> course (<em>${classGroup.className}</em>) starts today!</p>
        
        <p><strong>Course Details:</strong></p>
        <ul>
          <li>Start Time: ${formatDate(classGroup.startDate)}</li>
          <li>Location: ${classGroup.location || 'Online'}</li>
          <li>Learning Mode: ${classGroup.learningMode}</li>
        </ul>
        
        <p>Please ensure you're prepared and ready to begin your learning journey. Don't forget to log in to your dashboard at <a href="https://codefast.collabogig.com">codefast.collabogig.com</a> to access course materials.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        Prince Lee<br>
        Lead Instructor, Code-Fast<br>
        Collabogig Innovations</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send weekly progress email
export const sendWeeklyProgressEmail = async (user, classGroup, courseTemplate, weekNumber, prepLinks) => {
  // Skip sending prep links for free course users if they shouldn't receive them
  if (user.courseStatus === 'free' && !user.canReceivePrepLinks) {
    return { skipped: true, reason: 'Free user without prep links access' };
  }
  
  const mailOptions = {
    from: 'code-fast@collabogig.com',
    to: user.email,
    subject: `Week ${weekNumber} Progress - ${courseTemplate.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6ee0;">Weekly Progress Update</h2>
        </div>
        
        <p>Dear ${user.name},</p>
        
        <p>Congratulations on completing Week ${weekNumber} of your <strong>${courseTemplate.title}</strong> course!</p>
        
        <p>You've made excellent progress this week, and we're excited to see your continued growth and development.</p>
        
        ${user.courseStatus !== 'free' || user.canReceivePrepLinks ? `
        <p><strong>Preparation Materials for Next Week:</strong></p>
        <ul>
          ${prepLinks.map(link => `<li><a href="${link.url}">${link.title}</a> - ${link.description}</li>`).join('')}
        </ul>
        
        <p>Please review these materials before your next class to get the most out of your learning experience.</p>
        ` : ''}
        
        <p>Remember to check your dashboard at <a href="https://codefast.collabogig.com">codefast.collabogig.com</a> for additional resources and updates.</p>
        
        <p>Best regards,<br>
        Prince Lee<br>
        Lead Instructor, Code-Fast<br>
        Collabogig Innovations</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send upgrade promotion email to free users
import { getPromoTemplateByIndex } from './promoMessages.js';

export const sendUpgradePromotionEmail = async (user, courseTemplate, weekIndex = 0) => {
  if (user.courseStatus !== 'free') {
    return { skipped: true, reason: 'User is not on free plan' };
  }
  
  // Get a template based on the week index for rotation
  const template = getPromoTemplateByIndex(weekIndex);
  
  const mailOptions = {
    from: 'code-fast@collabogig.com',
    to: user.email,
    subject: template.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4a6ee0;">${template.title}</h2>
        </div>
        
        <p>Dear ${user.name},</p>
        
        <p>We hope you're enjoying your free introduction to <strong>${courseTemplate.title}</strong>!</p>
        
        <p>${template.intro}</p>
        
        <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          ${template.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://codefast.collabogig.com/upgrade" style="background-color: #4a6ee0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">${template.cta}</a>
        </div>
        
        <p>${template.closing}</p>
        
        <p>Best regards,<br>
        Prince Lee<br>
        Lead Instructor, Code-Fast<br>
        Collabogig Innovations</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send password reset email
export const sendPasswordResetEmail = async (to, name, resetLink) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://collabogig.com/logo.png" alt="Collabogig Logo" style="max-width: 150px;">
        </div>
        <h2 style="color: #3D1156; text-align: center;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3D1156; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetLink}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Best regards,<br>Collabogig Innovations Team</p>
      </div>
    `,
    text: `Hello ${name},\n\nWe received a request to reset your password. If you didn't make this request, you can ignore this email.\n\nTo reset your password, click the link below:\n\n${resetLink}\n\nThis link will expire in 1 hour for security reasons.\n\nBest regards,\nCollabogig Innovations Team`
  };

  return transporter.sendMail(mailOptions);
};

