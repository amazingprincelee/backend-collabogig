import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cron from 'node-cron';
import { connect } from './config/db.js'
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoute.js';
import contactRoute from './routes/contactRoute.js';
import courseRoute from './routes/courseRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import staffRoute from './routes/staffRoute.js';
import reportRoute from './routes/reportRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import projectRoute from './routes/projectRoute.js';
import partnersRoute from './routes/partnerRoute.js';
import adminRoute from './routes/adminRoute.js';
import emailRoute from './routes/emailRoute.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import updateStatuses from './utils/updateStatuses.js';
import { sendCourseStartReminders, sendWeeklyProgressEmails, sendUpgradePromotionEmails } from './utils/emailReminders.js';
const app = express();
dotenv.config();

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'https://codefast.collabogig.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));



//database connection
connect()

// Routes
app.use('/api/services',  serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user',  userRoutes);
app.use('/api/contact-form', contactRoute);
app.use('/api/course',  courseRoute);
app.use('/api/notification',  notificationRoute);
app.use('/api/staff',  staffRoute);
app.use('/api/report',  reportRoute);
app.use('/api/payment',  paymentRoute);
app.use('/api/project',  projectRoute);
app.use('/api/partners',  partnersRoute);
app.use('/api/admin',  adminRoute);
app.use('/api/email',  emailRoute);
app.use('/api/password-reset', passwordResetRoutes);


// Schedule updateStatuses to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running status update task...');
  try {
    await updateStatuses();
  } catch (error) {
    console.error('Scheduled task failed:', error.message);
  }
});

// Schedule course start reminders to run every morning at 7:00 AM Nigerian time (6:00 AM UTC)
cron.schedule('0 6 * * *', async () => {
  console.log('Running course start reminder task...');
  try {
    await sendCourseStartReminders();
  } catch (error) {
    console.error('Course start reminder task failed:', error.message);
  }
});

// Schedule weekly progress emails to run every Friday at 3:00 PM Nigerian time (2:00 PM UTC)
cron.schedule('0 14 * * 5', async () => {
  console.log('Running weekly progress email task...');
  try {
    await sendWeeklyProgressEmails();
  } catch (error) {
    console.error('Weekly progress email task failed:', error.message);
  }
});

// Schedule upgrade promotion emails to run every Wednesday at 10:00 AM Nigerian time (9:00 AM UTC)
cron.schedule('0 9 * * 3', async () => {
  console.log('Running upgrade promotion email task...');
  try {
    await sendUpgradePromotionEmails();
  } catch (error) {
    console.error('Upgrade promotion email task failed:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));