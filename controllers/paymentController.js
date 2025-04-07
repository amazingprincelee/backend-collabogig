import Payment from '../models/payment.js';
import Course from '../models/course.js';
import Project from '../models/projects.js';
import User from '../models/users.js';
import { initializePayment, verifyFlutterwavePayment } from '../utils/flutterwave.js';

export const createPayment = async (req, res) => {
  try {
    const { userName, amount, serviceType, serviceId } = req.body;
    const userId = req.user.id;

    // Validate service
    const Model = serviceType === 'Course' ? Course : Project;
    const service = await Model.findById(serviceId);
    if (!service) return res.status(404).json({ message: `${serviceType} not found` });

    // Initialize payment with Flutterwave
    const paymentData = await initializePayment(amount, 'NGN');
    const transactionId = paymentData.data.tx_ref;

    const payment = new Payment({
      userName,
      amount,
      transactionId,
      serviceType,
      serviceId,
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment initialized successfully',
      payment,
      paymentLink: paymentData.data.link,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const isVerified = await verifyFlutterwavePayment(transactionId);
    if (isVerified) {
      payment.status = 'Success';

      // Handle service-specific logic
      if (payment.serviceType === 'Course') {
        const course = await Course.findById(payment.serviceId);
        if (course && course.enrolledUsers.length < course.capacity) {
          course.enrolledUsers.push(req.user.id);
          await course.save();

          const user = await User.findById(req.user.id);
          user.courses.push(payment.serviceId);
          await user.save();
        }
      } else if (payment.serviceType === 'Project') {
        const project = await Project.findById(payment.serviceId);
        if (project && !project.assignedUsers.includes(req.user.id)) {
          project.assignedUsers.push(req.user.id);
          project.status = 'In Progress'; // Optional: Start project on payment
          await project.save();
        }
      }

      await payment.save();
      res.status(200).json({ message: 'Payment verified successfully', payment });
    } else {
      payment.status = 'Failed';
      await payment.save();
      res.status(400).json({ message: 'Payment verification failed', payment });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userName: req.user.firstName + ' ' + req.user.surName });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};