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
import updateStatuses from './utils/updateStatuses.js';
const app = express();
dotenv.config();

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended: false}));



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


// Schedule updateStatuses to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running status update task...');
  try {
    await updateStatuses();
  } catch (error) {
    console.error('Scheduled task failed:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));