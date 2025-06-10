import Notification from '../models/Notification.js';
import { sendVerificationEmail } from '../utils/nodemailer.js'; 

export const createNotification = async (req, res) => {
  try {
    const { recipient, message, type } = req.body;

    // Check if admin (optional)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const notification = new Notification({
      recipient,
      message,
      type,
    });

    await notification.save();

    // Send email if type is 'Email'
    if (type === 'Email') {
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      await sendVerificationEmail(recipientUser.email, message); // Using as a generic email sender
      notification.status = 'Sent'; // Update status after successful send
      await notification.save();
    }

    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationAsSent = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    // Check if user is the recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Not your notification' });
    }

    notification.status = 'Sent';
    await notification.save();

    res.status(200).json({ message: 'Notification marked as sent', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
};

// Scheduled notification function (e.g., daily reminders)
export const sendScheduledNotifications = async () => {
  try {
    // Example: Notify staff about pending tasks (customize as needed)
    const pendingNotifications = await Notification.find({ status: 'Pending', type: 'Email' });
    for (const notification of pendingNotifications) {
      const recipientUser = await User.findById(notification.recipient);
      if (recipientUser) {
        await sendVerificationEmail(recipientUser.email, notification.message);
        notification.status = 'Sent';
        await notification.save();
      }
    }
    console.log('Scheduled notifications sent successfully');
  } catch (error) {
    console.error('Failed to send scheduled notifications:', error.message);
  }
};