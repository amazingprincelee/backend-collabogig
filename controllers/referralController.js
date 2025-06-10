import Referral from '../models/referral.js';
import User from '../models/users.js';
import { nanoid } from 'nanoid';
import { sendNotificationEmail } from '../utils/email.js';


// Generate Referral Link
export const generateReferralLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.referralCode) {
      user.referralCode = nanoid(10);
      await user.save();
    }

    const referralLink = `${process.env.APP_URL}/landing?ref=${user.referralCode}`;
    res.json({ referralLink, referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate referral link', error: error.message });
  }
};

// Create Referral
export const createReferral = async (req, res) => {
  try {
    const { referredEmail } = req.body;
    const referrer = await User.findById(req.user.id);
    if (!referrer) return res.status(404).json({ message: 'Referrer not found' });

    const existingReferral = await Referral.findOne({ referredEmail });
    if (existingReferral) {
      return res.status(400).json({ message: 'Email already referred' });
    }

    const referral = new Referral({
      referrerId: req.user.id,
      referredEmail,
      referralCode: referrer.referralCode || nanoid(10),
      type: 'student',
      commissionPercentage: 10,
      status: 'Pending',
    });

    await referral.save();
    referrer.referrals.push(referral._id);
    await referrer.save();

    await sendNotificationEmail(
      referrer.email,
      `You referred ${referredEmail} to join CodeFast Academy!`
    );

    res.json({ message: 'Referral created', referral });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create referral', error: error.message });
  }
};

// Get Referrals
export const getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'referrals',
      populate: { path: 'referredUserId', select: 'name email' },
    });
    res.json(user.referrals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referrals', error: error.message });
  }
};

// Get Referral Stats
export const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('downlines', 'name email')
      .populate('referrals');

    const referrals = await Referral.find({ referrerId: req.user.id });
    const totalCommission = referrals.reduce((sum, ref) => sum + ref.commission, 0);
    const totalDownlines = user.downlines.length;
    const pendingReferrals = referrals.filter((ref) => ref.status === 'Pending').length;
    const paidReferrals = referrals.filter((ref) => ref.status === 'Paid').length;

    res.json({
      totalCommission,
      totalDownlines,
      pendingReferrals,
      paidReferrals,
      downlines: user.downlines,
      referrals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referral stats', error: error.message });
  }
};

// Handle Referral Registration
export const handleReferralRegistration = async (req, res) => {
  try {
    const { referralCode, email } = req.body;
    const newUser = await User.findOne({ email });
    if (!newUser) return res.status(404).json({ message: 'New user not found' });

    const referral = await Referral.findOne({ referralCode, referredEmail: email });
    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    const referrer = await User.findById(referral.referrerId);
    if (!referrer) return res.status(404).json({ message: 'Referrer not found' });

    referral.referredUserId = newUser._id;
    referral.status = 'Free Class';
    await referral.save();

    if (!referrer.downlines.includes(newUser._id)) {
      referrer.downlines.push(newUser._id);
      await referrer.save();
    }

    newUser.referralCode = nanoid(10);
    await newUser.save();

    await sendNotificationEmail(
      referrer.email,
      `${newUser.name} registered via your referral link!`
    );

    res.json({ message: 'Referral registration processed', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process referral registration', error: error.message });
  }
};