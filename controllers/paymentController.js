import Payment from '../models/payment.js';
import User from '../models/users.js';
import ClassGroup from '../models/classGroup.js';
import Referral from '../models/referral.js';
import { verifyFlutterwavePayment, initializePayment } from '../utils/flutterwave.js';
import { verifyPaystackPayment, initializePaystackPayment } from '../utils/paystack.js';
import { sendNotificationEmail, sendWelcomeWithTempPassword } from '../utils/nodemailer.js';
import { sendTermiiSMS } from '../utils/termii.js';

import crypto from 'crypto';

const verifyPaystackWebhook = (req) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secretKey)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return hash === req.headers['x-paystack-signature'];
};

export const createPayment = async (req, res) => {
  try {
    const {
      userName,
      email,
      phone,
      amount,
      serviceType,
      serviceId,
      provider = 'paystack',
    } = req.body;

  

    const userId = req.user ? req.user.id : null;

    if (!userName || !email || !phone || !serviceType || !serviceId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['Course', 'Other'].includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }
    if (!['flutterwave', 'paystack'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid payment provider' });
    }

    const rawTransactionId = `codefast-${serviceType.toLowerCase()}-${serviceId}-${Date.now()}`;
    const transactionId = rawTransactionId.replace(/[^a-zA-Z0-9\-=\.]/g, '');
    console.log('Sanitized transactionId:', transactionId);

    let paymentLink;

    if (provider === 'flutterwave') {
      const flutterResponse = await initializePayment(
        amount,
        'NGN',
        { email, name: userName, phonenumber: phone },
        transactionId,
        { email, phone, name: userName, serviceId }
      );
      if (flutterResponse.status !== 'success') {
        throw new Error('Flutterwave payment initialization failed');
      }
      paymentLink = flutterResponse.data.link;
    } else if (provider === 'paystack') {
      const paystackResponse = await initializePaystackPayment(
        amount,
        'NGN',
        { email, name: userName, phonenumber: phone },
        transactionId,
        { email, phone, name: userName, serviceId, userId }
      );
      paymentLink = paystackResponse.data.authorization_url;
    }

    const payment = new Payment({
      userId,
      email,
      amount,
      transactionId,
      serviceType,
      serviceId,
      provider,
      status: 'pending',
      meta: { email, phone, name: userName, serviceId, userId },
    });
    await payment.save();

    return res.status(201).json({
      message: 'Payment initiated successfully',
      paymentLink,
      payment: {
        transactionId,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Create payment error:', error.message);
    return res.status(400).json({ message: 'Payment creation failed', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const payment = await Payment.findOne({ transactionId }).populate('userId');
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    let isValid;
    if (payment.provider === 'flutterwave') {
      isValid = await verifyFlutterwavePayment(transactionId);
    } else if (payment.provider === 'paystack') {
      const result = await verifyPaystackPayment(transactionId);
      isValid = result.success;
    }

    if (!isValid) {
      return res.json({ success: false, message: 'Payment verification failed' });
    }

    payment.status = 'successful';
    await payment.save();

    const user = await User.findById(payment.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.paymentStatus = 'success';
    user.courseStatus = 'enrolled';
    user.paymentDetails.push(payment._id);

    if (payment.serviceType === 'Course') {
      const classGroup = await ClassGroup.findById(payment.serviceId);
      if (!classGroup) return res.status(404).json({ message: 'Class group not found' });

      if (!user.courses.includes(classGroup._id)) {
        user.courses.push(classGroup._id);
      }
      if (!classGroup.enrolledUsers.includes(user._id)) {
        classGroup.enrolledUsers.push(user._id);
        await classGroup.save();
      }
    }

    await user.save();

    const referral = await Referral.findOne({ referredUserId: user._id, status: { $ne: 'Completed' } });
    if (referral) {
      const commission = (payment.amount * referral.commissionPercentage) / 100;
      referral.commission += commission;
      referral.status = 'Paid';
      await referral.save();

      const referrer = await User.findById(referral.referrerId);
      if (referrer) {
        await sendNotificationEmail(
          referrer.email,
          `You earned a ${referral.commissionPercentage}% commission (${commission} NGN) from ${user.name}'s payment!`
        );
      }
    }

    await sendNotificationEmail(user.email, 'Your payment was successful! Course access granted.');

    const classGroup = await ClassGroup.findById(payment.serviceId);
    if (classGroup?.startDate && new Date(classGroup.startDate) - new Date() < 24 * 60 * 60 * 1000) {
      await sendTermiiSMS(user.phone, `Your paid course starts tomorrow at ${classGroup.startDate.toLocaleString()} WAT!`);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

export const paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyPaystackWebhook(req)) {
      console.log("Webhook signature verification failed", {
        headers: req.headers,
        signature: req.headers['x-paystack-signature']
      });
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log("Paystack event:", event);
    
    const transactionId = event.data.reference;

    const payment = await Payment.findOne({ transactionId }).populate('userId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (event.event === 'charge.success' && payment.status !== 'successful') {
      payment.status = 'successful';
      await payment.save();

      const classGroup = await ClassGroup.findById(payment.serviceId).populate('courseTemplate');
      if (!classGroup || !classGroup.courseTemplate) {
        console.error('Class group or course template not found for payment:', transactionId);
        return res.status(200).json({ message: 'Webhook processed, but class data missing' });
      }

      let user = payment.userId ? await User.findById(payment.userId) : await User.findOne({ email: payment.meta.email });

      if (!user && payment.meta.email) {
        console.log("User not found, attempting to find by email:", payment.meta.email);
        user = await User.findOne({ email: payment.meta.email });
      }

      if (!user) {
        console.error("User not found for payment:", {
          paymentId: payment._id,
          userId: payment.userId,
          email: payment.meta.email
        });
        return res.status(404).json({ message: 'User not found for this payment' });
      }

      if (!user.courses.includes(classGroup._id)) {
        user.courses.push(classGroup._id);
        user.paymentStatus = 'success';
        user.courseStatus = 'paid';
        user.paymentDetails.push(payment._id);
        await user.save();
      }

      if (!classGroup.enrolledUsers.includes(user._id)) {
        classGroup.enrolledUsers.push(user._id);
        await classGroup.save();
      }

      const referral = await Referral.findOne({ referredUserId: user._id, status: { $ne: 'Completed' } });
      if (referral) {
        const commission = (payment.amount * referral.commissionPercentage) / 100;
        referral.commission += commission;
        referral.status = 'Paid';
        await referral.save();

        const referrer = await User.findById(referral.referrerId);
        if (referrer) {
          await sendNotificationEmail(
            referrer.email,
            `You earned a ${referral.commissionPercentage}% commission (${commission} NGN) from ${user.name}'s payment!`
          );
        }
      }

      await sendNotificationEmail(user.email, 'Your payment was successful! Course access granted.');

      if (classGroup.startDate && new Date(classGroup.startDate) - new Date() < 24 * 60 * 60 * 1000) {
        await sendTermiiSMS(user.phone, `Your paid course starts tomorrow at ${classGroup.startDate.toLocaleString()} WAT!`);
      }

      return res.status(200).json({ message: 'Payment processed successfully', transactionId });
    }

    return res.status(200).json({ message: 'Webhook received, no action taken' });
  } catch (error) {
    console.error('Webhook error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      headers: req.headers
    });
    return res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
};



export const paymentCallback = async (req, res) => {
  try {
    const { reference, status } = req.query;
    if (!reference || !status) {
      return res.redirect('/enrollment-failed?reason=invalid_parameters');
    }

    if (status !== 'success') {
      return res.redirect('/enrollment-failed?reason=cancelled');
    }

    // Redirect to frontend with transactionId for polling
    return res.redirect(`${process.env.FRONTEND_URL}/payment-status?transactionId=${reference}`);
  } catch (error) {
    console.error('Payment callback error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.redirect('/enrollment-failed?reason=server_error');
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.status(200).json({ status: payment.status });
  } catch (error) {
    console.error('Get payment status error:', error.message);
    return res.status(500).json({ message: 'Failed to get payment status', error: error.message });
  }
};