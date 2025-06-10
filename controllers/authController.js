import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import Referral from '../models/referral.js';
import { nanoid } from 'nanoid';
import {config} from 'dotenv';
import { sendNotificationEmail, sendWelcomeWithTempPassword } from '../utils/nodemailer.js'
config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register User


// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    const token = jwt.sign({ 
      id: user._id,
      email: user.email,
      role: user.role  // Make sure this is included
    }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};


export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already registered' });
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with the hashed password
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'client',
      referralCode: nanoid(10), // Assign unique referral code
    });

    await newUser.save();

    // Handle referral if referralCode is provided
    if (referralCode) {
      const referral = await Referral.findOne({ referralCode, referredEmail: email });
      if (referral) {
        const referrer = await User.findById(referral.referrerId);
        if (referrer) {
          referral.referredUserId = newUser._id;
          referral.status = 'Free Class';
          await referral.save();

          if (!referrer.downlines.includes(newUser._id)) {
            referrer.downlines.push(newUser._id);
            referrer.referrals.push(referral._id);
            await referrer.save();
          }

          await sendNotificationEmail(
            referrer.email,
            `${newUser.name} registered via your referral link!`
          );
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Registration successful', token, user: { id: newUser._id, email, role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
};