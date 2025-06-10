import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String },
  amount: { 
    type: Number, 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true // Ensures no duplicate transactions
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  serviceType: { 
    type: String, 
    enum: ['Course', 'Project'], 
    required: true 
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'serviceType' // Dynamic reference based on serviceType
  },
  provider: { 
    type: String, 
    enum: ['flutterwave', 'paystack'], 
    default: 'flutterwave', 
    required: true 
  },
  meta: {
    email: String,
    phone: String,
    name: String,
    serviceId: String,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Optional: Add timestamps to automatically manage createdAt and updatedAt
  timestamps: true
});

// Custom validator or middleware to ensure refPath works with correct models
paymentSchema.path('serviceId').validate(function (value) {
  const serviceType = this.serviceType;
  if (serviceType === 'Course') {
    return mongoose.model('ClassGroup').exists({ _id: value }); // Check if ClassGroup exists
  } else if (serviceType === 'Project') {
    return mongoose.model('Project').exists({ _id: value }); // Check if Project exists
  }
  return false;
}, 'Invalid serviceId for the given serviceType');

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;