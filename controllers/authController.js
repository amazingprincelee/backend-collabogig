import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

export const register = async (req, res) => {
  try {
    const { firstName, surName, phone, email, role, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      surName,
      phone,
      email,
      password: hashedPassword,
      role: role, 
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8); // e.g. "a1b2c3d4"
  
      // Hash it
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
  
      // Update user password
      user.password = hashedPassword;
      await user.save();
  
      // Send email
      await sendTemporaryPassword(email, tempPassword);
  
      res.status(200).json({ message: 'Temporary password sent to your email.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to process password reset.' });
    }
  };
