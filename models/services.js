import mongoose from 'mongoose';



const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Percentage
    timeLogged: { type: Number, default: 0 }, // Hours spent
    files: [{ type: String }], // Store file paths or URLs (e.g., uploaded to cloud storage)
    comments: [{
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
  });
  
  const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  });



  const serviceAssignmentSchema = new mongoose.Schema({
    requestType: {
      type: String,
      required: true,
      enum: ['ServiceRequest'], // Simplified to only reference ServiceRequest
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceRequest', // Direct reference to ServiceRequest
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
      },
    ],
    tasks: [taskSchema], // Embed taskSchema
    milestones: [milestoneSchema], // Embed milestoneSchema
    overallProgress: { type: Number, default: 0 }, // Added for progress tracking
    assignedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['In Progress', 'Completed'],
      default: 'In Progress',
    },
  });


  const timeLogSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectAssignment.tasks', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    hours: { type: Number, required: true },
    loggedAt: { type: Date, default: Date.now },
  });
  


const serviceRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: Number, required: true },
  budget: { type: Number, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: String,
  message: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Completed'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },

 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  staffAssigned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
    },
  ],


  isGuest: {
    type: Boolean,
    default: true,
  },
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
const ServiceAssignment = mongoose.model('ServiceAssignment', serviceAssignmentSchema);
const Task = mongoose.model("Task", taskSchema);
const MileStone = mongoose.model("MileStone", milestoneSchema);
const TimeLog = mongoose.model("TimeLog", timeLogSchema)


export  {ServiceRequest, ServiceAssignment, Task, MileStone, TimeLog};
