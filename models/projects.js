import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users assigned to the project
  budget: { type: Number, required: true }, // From service request
  location: { type: String }, // Optional, unlike Course
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', projectSchema);

export default Project;