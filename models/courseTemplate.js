import mongoose from 'mongoose';

const courseTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fee: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

const CourseTemplate = mongoose.model('CourseTemplate', courseTemplateSchema);
export default CourseTemplate;
