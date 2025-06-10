import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  studentReferralPercentage: { type: Number, default: 10 }, // Percentage for student referrals, set by admin
  appDevReferralPercentage: { type: Number, default: 15 }, // Percentage for app development referrals, set by admin
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Referral' }],
  totalEarnings: { type: Number, default: 0 }, // Total earnings from all referrals
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Partner', partnerSchema);