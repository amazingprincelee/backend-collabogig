import Staff from '../models/staff.js';
import User from '../models/users.js';

export const createStaff = async (req, res) => {
  try {
    const { user, department, position, employmentDate } = req.body;

    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Verify user exists and is a staff role
    const userRecord = await User.findById(user);
    if (!userRecord) return res.status(404).json({ message: 'User not found' });
    if (userRecord.role !== 'staff') {
      return res.status(400).json({ message: 'User role must be "staff"' });
    }

    const staff = new Staff({
      user,
      department,
      position,
      employmentDate: employmentDate || Date.now(),
    });

    await staff.save();

    // Link staff record to user
    userRecord.staff = staff._id;
    await userRecord.save();

    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create staff', error: error.message });
  }
};

export const getAllStaff = async (req, res) => {
  try {
    // Optional: Restrict to admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const staff = await Staff.find().populate('user', 'firstName surName email');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('user', 'firstName surName email');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
  }
};