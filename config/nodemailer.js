import 'dotenv/config.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAIL_HOST,
  port: 465,  
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODE_MAIL_PWDS, 
  },
});




  // Verify SMTP configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP configuration error:');
    console.error(error);
  } else {
    console.log("SMTP configuration is correct. Server is ready to take our messages.");
  }
});

export const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig verification Code',
    text: `Dear User,\n\nYour verification code is: ${code}\n\nThank you for choosing Collabogig Innovations.\n\nBest regards,\nCollabogig Innovations Team`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async (to, message) => {
    const mailOptions = {
      from: 'no-reply@collabogig.com',
      to,
      subject: 'Collabogig Notification',
      text: `Dear User,\n\n${message}\n\nBest regards,\nCollabogig Innovations Team`,
    };
    return transporter.sendMail(mailOptions);
  };

export const sendTemporaryPassword = async (to, tempPassword) => {
  const mailOptions = {
    from: 'no-reply@collabogig.com',
    to,
    subject: 'Collabogig Temporary Password Reset',
    text: `Dear User,\n\nYour temporary password is: ${tempPassword}\n\nPlease log in using this password and change it immediately.\n\nBest regards,\nCollabogig Innovations Team`,
  };

  return transporter.sendMail(mailOptions);
};