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