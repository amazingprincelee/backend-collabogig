import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Project', 'Course', 'Staff'], required: true },
  data: { type: Object, required: true }, 
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false, 
  },
  generatedAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);

export default Report;