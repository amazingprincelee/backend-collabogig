import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Email', 'InApp'], required: true },
  status: { type: String, enum: ['Sent', 'Pending'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);


export default Notification