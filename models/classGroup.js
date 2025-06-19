import mongoose from 'mongoose';

const prepLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  weekNumber: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const classGroupSchema = new mongoose.Schema({
  courseTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTemplate', required: true },
  className: { type: String, required: true }, // e.g., "Frontend Dev – July Batch"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  capacity: { type: Number, default: 50 },
  location: { type: String },
  learningMode: { type: String, enum: ['onSite', 'online', 'hybrid'], default: 'online' },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  prepLinks: [prepLinkSchema], // YouTube prep links for each week
  createdAt: { type: Date, default: Date.now }
});

const ClassGroup = mongoose.model('ClassGroup', classGroupSchema);
export default ClassGroup;
