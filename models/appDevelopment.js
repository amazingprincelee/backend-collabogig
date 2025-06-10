import mongoose from 'mongoose';

const appDevProjectSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  clientEmail: { type: String, required: true },
  projectDetails: { type: String, required: true },
  amount: { type: Number, required: true }, // Project cost in NGN
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  commission: { type: Number, default: 0 }, // Commission earned by the partner
  commissionPercentage: { type: Number, required: true }, // Percentage used for this project
  referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' }, // Link to the referral
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AppDevProject', appDevProjectSchema);