import Payment from '../models/payment.js';
import User from '../models/users.js';
import ClassGroup from '../models/classGroup.js';
import Referral from '../models/referral.js';
import CourseTemplate from '../models/courseTemplate.js';
import Project from '../models/projects.js';
import { verifyFlutterwavePayment, initializePayment } from '../utils/flutterwave.js';
import { verifyTransaction, initiateTransfer } from '../utils/paystack.js';
import { sendNotificationEmail, sendWelcomeWithTempPassword } from '../utils/nodemailer.js';
import { sendTermiiSMS } from '../utils/termii.js';

export const createPayment = async (req, res) => {
  try {
    // Destructure from the custom req.body passed from courseController
    const {
      userName,
      email,
      phone,
      amount,
      serviceType,
      serviceId,
      provider = 'flutterwave',
    } = req.body;

    const userId = req.user ? req.user.id : null;

    // Validate required fields
    if (!userName || !email || !phone || !serviceType || !serviceId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['Course', 'Other'].includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }
    if (!['flutterwave', 'paystack'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid payment provider' });
    }

    // Generate transaction ID
    const transactionId = `codefast_${serviceType.toLowerCase()}_${serviceId}_${Date.now()}`;
    let paymentLink;

    // Initialize payment based on provider
    if (provider === 'flutterwave') {
      try {
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
        console.log('Flutterwave payment link:', paymentLink);
      } catch (flutterError) {
        console.error('Flutterwave initialization error:', flutterError.message);
        return res.status(400).json({ message: 'Flutterwave payment initialization failed', error: flutterError.message });
      }
    } else if (provider === 'paystack') {
      try {
        const paystackResponse = await initializePaystackPayment(
          amount,
          email,
          transactionId,
          { email, phone, name: userName, serviceId }
        );
        paymentLink = paystackResponse.data.authorization_url;
        console.log('Paystack payment link:', paymentLink);
      } catch (paystackError) {
        console.error('Paystack error:', paystackError.message);
        return res.status(400).json({ message: 'Paystack payment initialization failed', error: paystackError.message });
      }
    }

    // Save payment record
    try {
      const payment = new Payment({
        userId,
        email,
        amount,
        transactionId,
        serviceType,
        serviceId,
        provider,
        status: 'pending',
        meta: { email, phone, name: userName, serviceId },
      });
      await payment.save();
      console.log('Payment document saved:', payment);
    } catch (dbError) {
      console.error('Database error saving payment:', dbError.message);
      return res.status(400).json({ message: 'Failed to save payment record', error: dbError.message });
    }

    // Return success response with payment link
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
      const result = await verifyTransaction(transactionId);
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

export const paymentCallback = async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.query;
    if (!tx_ref || !status || !transaction_id) {
      return res.redirect('/enrollment-failed?reason=invalid_parameters');
    }

    if (status !== 'successful') {
      return res.redirect('/enrollment-failed?reason=cancelled');
    }

    const payment = await Payment.findOne({ transactionId: tx_ref }).populate('userId');
    if (!payment) {
      return res.redirect('/enrollment-failed?reason=payment_not_found');
    }

    let verificationData;
    if (payment.provider === 'flutterwave') {
      verificationData = await verifyFlutterwavePayment(tx_ref);
      if (!verificationData || verificationData.status !== 'success') {
        return res.redirect('/enrollment-failed?reason=verification_failed');
      }
    } else if (payment.provider === 'paystack') {
      const result = await verifyTransaction(tx_ref);
      if (!result.success) {
        return res.redirect('/enrollment-failed?reason=verification_failed');
      }
      verificationData = result.data;
    }

    payment.status = 'successful';
    await payment.save();

    const classGroup = await ClassGroup.findById(payment.serviceId).populate('courseTemplate');
    if (!classGroup || !classGroup.courseTemplate) {
      return res.redirect('/enrollment-failed?reason=invalid_class');
    }

    if (payment.serviceType === 'Course' && payment.amount !== classGroup.courseTemplate.fee) {
      return res.redirect('/enrollment-failed?reason=invalid_amount');
    }

    const userData = {
      email: payment.meta?.email || verificationData?.customer?.email,
      name: payment.meta?.name || verificationData?.customer?.name || 'Anonymous',
      phone: payment.meta?.phone || verificationData?.customer?.phonenumber || '',
    };

    if (!userData.email) {
      return res.redirect('/enrollment-failed?reason=missing_user_data');
    }

    let user = payment.userId ? await User.findById(payment.userId) : await User.findOne({ email: userData.email });

    if (user) {
      if (user.courses.includes(classGroup._id)) {
        return res.redirect('/enrollment-failed?reason=already_enrolled');
      }
      user.paymentStatus = 'success';
      user.courseStatus = 'enrolled';
      user.paymentDetails.push(payment._id);
      user.courses.push(classGroup._id);
      await user.save();
    } else {
      const tempPassword = Math.random().toString(36).slice(-8);
      user = new User({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        options: 'paid_course',
        password: tempPassword,
        role: 'student',
        courseStatus: 'enrolled',
        paymentStatus: 'success',
        courses: [classGroup._id],
        paymentDetails: [payment._id],
      });
      await user.save();

      await sendWelcomeWithTempPassword(
        user.email,
        user.name,
        classGroup.className,
        tempPassword
      );
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

    if (classGroup.startDate && new Date(classGroup.startDate) - new Date() < 24 * 60 * 60 * 1000) {
      await sendTermiiSMS(
        user.phone,
        `Your paid course starts tomorrow at ${classGroup.startDate.toLocaleString()} WAT!`
      );
    }

    return res.redirect('/enrollment-success');
  } catch (error) {
    console.error('Payment callback error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return res.redirect('/enrollment-failed?reason=server_error');
  }
};