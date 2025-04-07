import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true }, // From Flutterwave
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  serviceType: { type: String, enum: ['Course', 'Project'], required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'serviceType' === 'Course' ? 'Course' : 'ProjectRequest', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;