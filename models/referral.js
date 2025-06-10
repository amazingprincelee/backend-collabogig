import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  referredEmail: { type: String, required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCode: { type: String, required: true, unique: true },
  type: { type: String, enum: ['student', 'appDev'], required: true },
  status: { type: String, enum: ['Pending', 'Free Class', 'Paid', 'Completed'], default: 'Pending' },
  commission: { type: Number, default: 0 },
  commissionPercentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Referral', referralSchema);