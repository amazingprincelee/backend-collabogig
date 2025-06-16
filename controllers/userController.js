import User from '../models/users.js'; 
import { upload } from '../utils/cloudinary.js';

export const getAllUsers = async (req, res) => {
  try {
    // Restrict to admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Get User Data
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('paymentDetails referrals');
    if (!user) throw new Error('User not found');
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, surName, phone, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Restrict to admins or self
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Admins or self only' });
    }

    // Update basic fields
    user.firstName = firstName || user.firstName;
    user.surName = surName || user.surName;
    user.phone = phone || user.phone;
    user.email = email || user.email;

    // Handle profile photo upload if file is provided
    if (req.file) {
      const folderName = `users/${userId}`;
      const uploadedImage = await upload(req.file.path, folderName);
      user.profilePhoto = uploadedImage.secure_url; // Store Cloudinary URL
    }

    await user.save();

    const updatedUser = user.toObject({ getters: true, versionKey: false });
    delete updatedUser.password; // Exclude password from response

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const { firstName, surName, phone, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic fields
    user.firstName = firstName || user.firstName;
    user.surName = surName || user.surName;
    user.phone = phone || user.phone;
    user.email = email || user.email;

    // Handle profile photo upload if file is provided
    if (req.file) {
      const folderName = `users/${userId}`;
      const uploadedImage = await upload(req.file.path, folderName);
      user.profilePhoto = uploadedImage.secure_url; // Store Cloudinary URL
    }

    await user.save();

    const updatedUser = user.toObject({ getters: true, versionKey: false });
    delete updatedUser.password; // Exclude password from response

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};


// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;
 console.log(confirmPassword);
 
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};