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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Verification Code</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear User,</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px; text-align: center;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; margin: 10px 0; letter-spacing: 2px; color: #3D1156;">${code}</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Thank you for choosing Collabogig Innovations.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations Team</p>
        </div>
      </div>
    `,
    text: `Dear User,\n\nYour verification code is: ${code}\n\nThank you for choosing Collabogig Innovations.\n\nBest regards,\nCollabogig Innovations Team`,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send welcome email with temporary password
export const sendWelcomeWithTempPassword = async (to, name, courseTitle, tempPassword) => {
  const mailOptions = {
    from: 'code-fast@collabogig.com',
    to,
    subject: 'Welcome to Code-Fast with Prince Lee - Your Course Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Welcome to Code-Fast with Prince Lee!</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear ${name},</p>
        
        <p style="color: #333; font-size: 16px;">Thank you for enrolling in Code-Fast with Prince Lee, Powered by collabogig.com!</p>
        
        <p style="color: #333; font-size: 16px;">You are now registered for the "${courseTitle}" course.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px; text-align: center;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Your temporary password is:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0; letter-spacing: 1px; color: #3D1156; background-color: #ffffff; padding: 10px; border-radius: 4px;">${tempPassword}</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Please visit <a href="https://codefast.collabogig.com" style="color: #3D1156; text-decoration: underline;">codefast.collabogig.com</a> to log in and change your password immediately after your first login for security purposes.</p>
        
        <p style="color: #333; font-size: 16px;">You can join our WhatsApp group for support and discussion: <a href="https://chat.whatsapp.com/KXDvG1OCChC3b33WkTTD0J" style="color: #3D1156; text-decoration: underline;">Click here to join</a></p>
        
        <p style="color: #333; font-size: 16px;">We are excited to have you join us on this learning journey. Should you need assistance, feel free to reply to this email.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px; font-weight: bold;">Prince Lee</p>
          <p style="color: #555; margin-bottom: 5px;">Lead Instructor, Code-Fast</p>
          <p style="color: #555; margin-bottom: 5px;">codefast.collabogig.com</p>
        </div>
      </div>
    `,
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
export const sendNotificationEmail = async (to, subject, message) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">${subject}</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear User,</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;">${message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations Team</p>
        </div>
      </div>
    `,
    text: message,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send temporary password
export const sendTemporaryPassword = async (to, tempPassword) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig Temporary Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Temporary Password</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear User,</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px; text-align: center;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Your temporary password is:</p>
          <p style="font-size: 18px; font-weight: bold; margin: 10px 0; letter-spacing: 1px; color: #3D1156; background-color: #ffffff; padding: 10px; border-radius: 4px;">${tempPassword}</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Please log in using this password and change it immediately for security purposes.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations Team</p>
        </div>
      </div>
    `,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Your Course Starts Today!</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear ${user.name},</p>
        
        <p style="color: #333; font-size: 16px;">We're excited to remind you that your <strong>${courseTemplate.title}</strong> course (<em>${classGroup.className}</em>) starts today!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Course Details:</p>
          <ul style="padding-left: 20px;">
            <li style="margin-bottom: 8px;">Start Time: ${formatDate(classGroup.startDate)}</li>
            <li style="margin-bottom: 8px;">Location: ${classGroup.location || 'Online'}</li>
            <li style="margin-bottom: 8px;">Learning Mode: ${classGroup.learningMode}</li>
            <li style="margin-bottom: 8px;">Meeting Link: <a href="https://meet.google.com/xob-xmna-zhy" style="color: #3D1156; text-decoration: underline;">https://meet.google.com/xob-xmna-zhy</a></li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px;">Please ensure you're prepared and ready to begin your learning journey. Don't forget to log in to your dashboard at <a href="https://codefast.collabogig.com" style="color: #3D1156; text-decoration: underline;">codefast.collabogig.com</a> to access course materials.</p>
        
        <p style="color: #333; font-size: 16px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px; font-weight: bold;">Prince Lee</p>
          <p style="color: #555; margin-bottom: 5px;">Lead Instructor, Code-Fast</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations</p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Weekly Progress Update</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear ${user.name},</p>
        
        <p style="color: #333; font-size: 16px;">Congratulations on completing Week ${weekNumber} of your <strong>${courseTemplate.title}</strong> course!</p>
        
        <p style="color: #333; font-size: 16px;">You've made excellent progress this week, and we're excited to see your continued growth and development.</p>
        
        ${user.courseStatus !== 'free' || user.canReceivePrepLinks ? `
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Preparation Materials for Next Week:</p>
          <ul style="padding-left: 20px;">
            ${prepLinks.map(link => `<li style="margin-bottom: 8px;"><a href="${link.url}" style="color: #3D1156; text-decoration: underline;">${link.title}</a> - ${link.description}</li>`).join('')}
          </ul>
          
          <p style="color: #333; font-size: 16px;">Please review these materials before your next class to get the most out of your learning experience.</p>
        </div>
        ` : ''}
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Next Class:</p>
          <ul style="padding-left: 20px;">
            <li style="margin-bottom: 8px;">Meeting Link: <a href="https://meet.google.com/xob-xmna-zhy" style="color: #3D1156; text-decoration: underline;">https://meet.google.com/xob-xmna-zhy</a></li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px;">Remember to check your dashboard at <a href="https://codefast.collabogig.com" style="color: #3D1156; text-decoration: underline;">codefast.collabogig.com</a> for additional resources and updates.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px; font-weight: bold;">Prince Lee</p>
          <p style="color: #555; margin-bottom: 5px;">Lead Instructor, Code-Fast</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations</p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">${template.title}</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Dear ${user.name},</p>
        
        <p style="color: #333; font-size: 16px;">We hope you're enjoying your free introduction to <strong>${courseTemplate.title}</strong>!</p>
        
        <p style="color: #333; font-size: 16px;">${template.intro}</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Premium Benefits:</p>
          <ul style="padding-left: 20px;">
            ${template.benefits.map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://codefast.collabogig.com/upgrade" style="background-color: #3D1156; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${template.cta}</a>
        </div>
        
        <p style="color: #333; font-size: 16px;">${template.closing}</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px; font-weight: bold;">Prince Lee</p>
          <p style="color: #555; margin-bottom: 5px;">Lead Instructor, Code-Fast</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations</p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #3D1156; border-radius: 8px 8px 0 0;">
          <img src="https://res.cloudinary.com/dc5b6xpyf/image/upload/v1751257838/latest_logo_with_name2_e7ss1o.png" alt="Collabogig Logo" style="max-width: 200px;">
        </div>
        
        <div style="text-align: center; margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h2 style="color: #3D1156; margin: 0;">Password Reset Request</h2>
        </div>
        
        <p style="color: #333; font-size: 16px;">Hello ${name},</p>
        
        <p style="color: #333; font-size: 16px;">We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        
        <p style="color: #333; font-size: 16px;">To reset your password, click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3D1156; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D1156; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0; font-weight: bold; color: #3D1156;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #ffffff; padding: 10px; border-radius: 4px; margin-bottom: 0;">${resetLink}</p>
        </div>
        
        <p style="color: #333; font-size: 16px;">This link will expire in 1 hour for security reasons.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #555; margin-bottom: 5px;">Best regards,</p>
          <p style="color: #555; margin-bottom: 5px;">Collabogig Innovations Team</p>
        </div>
      </div>
    `,
    text: `Hello ${name},\n\nWe received a request to reset your password. If you didn't make this request, you can ignore this email.\n\nTo reset your password, click the link below:\n\n${resetLink}\n\nThis link will expire in 1 hour for security reasons.\n\nBest regards,\nCollabogig Innovations Team`
  };

  return transporter.sendMail(mailOptions);
};

