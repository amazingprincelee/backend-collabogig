import { ServiceAssignment, ServiceRequest, Task, MileStone, TimeLog } from '../models/services.js';
import Project from '../models/projects.js';
import Course from '../models/course.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and TXT are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadFile = async (req, res) => {
  try {
    const { assignmentId, taskId } = req.params;
    const assignment = await ServiceAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const task = assignment.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.files.push(req.file.path);
    await assignment.save();

    res.status(201).json({ message: 'File uploaded', data: task });
  } catch (error) {
    res.status(400).json({ message: 'Error uploading file', errors: error.message });
  }
};

export { upload as uploadMiddleware };

export const addTask = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await ServiceAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.tasks.push(req.body);
    await assignment.save();

    const completedTasks = assignment.tasks.filter(task => task.status === 'Completed').length;
    assignment.overallProgress = (completedTasks / assignment.tasks.length) * 100 || 0;
    await assignment.save();

    res.status(201).json({ message: 'Task added', data: assignment });
  } catch (error) {
    res.status(500).json({ message: 'Error adding task', errors: error.message });
  }
};

export const addMilestone = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await ServiceAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.milestones.push(req.body);
    await assignment.save();

    res.status(201).json({ message: 'Milestone added', data: assignment });
  } catch (error) {
    res.status(500).json({ message: 'Error adding milestone', errors: error.message });
  }
};

export const logTime = async (req, res) => {
  try {
    const { assignmentId, taskId } = req.params;
    const { hours } = req.body;

    const assignment = await ServiceAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const task = assignment.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.timeLogged += hours;
    await assignment.save();

    res.status(200).json({ message: 'Time logged', data: task });
  } catch (error) {
    res.status(400).json({ message: 'Error logging time', errors: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { assignmentId, taskId } = req.params;
    const { content, staffId } = req.body;

    const assignment = await ServiceAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const task = assignment.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ staff: staffId, content });
    await assignment.save();

    res.status(201).json({ message: 'Comment added', data: task });
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', errors: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const activeProjects = await ServiceAssignment.countDocuments({ status: 'In Progress' });
    const overdueTasks = await ServiceAssignment.aggregate([
      { $unwind: '$tasks' },
      { $match: { 'tasks.deadline': { $lt: new Date() }, 'tasks.status': { $ne: 'Completed' } } },
      { $count: 'overdue' },
    ]);
    const staffWorkload = await ServiceAssignment.aggregate([
      { $unwind: '$staff' },
      { $group: { _id: '$staff', taskCount: { $sum: { $size: '$tasks' } } } },
      { $lookup: { from: 'staff', localField: '_id', foreignField: '_id', as: 'staffDetails' } },
    ]);

    res.status(200).json({
      activeProjects,
      overdueTasks: overdueTasks[0]?.overdue || 0,
      staffWorkload,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', errors: error.message });
  }
};

// New function to create a ServiceRequest
export const createServiceRequest = async (req, res) => {
  try {
    const { title, type, budget, fullName, email, phone, location, message, priority } = req.body;
    const userId = req.user ? req.user.id : null; // Authenticated user or guest

    const serviceRequest = new ServiceRequest({
      title,
      type,
      budget,
      fullName,
      email,
      phone,
      location,
      message,
      priority,
      user: userId,
      isGuest: !userId,
    });

    await serviceRequest.save();

    res.status(201).json({ message: 'Service request created successfully', serviceRequest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service request', error: error.message });
  }
};

// New function to process a ServiceRequest into a ServiceAssignment, Project, or Course
export const processServiceRequest = async (req, res) => {
  try {
    const { serviceRequestId, staffIds } = req.body;

    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) return res.status(404).json({ message: 'Service request not found' });

    // Create a Project or Course based on type
    let service;
    if (serviceRequest.type === 'Project') {
      service = new Project({
        title: serviceRequest.title,
        description: serviceRequest.message,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days
        budget: serviceRequest.budget,
        location: serviceRequest.location || 'Remote',
      });
    } else if (serviceRequest.type === 'Course') {
      service = new Course({
        title: serviceRequest.title,
        description: serviceRequest.message,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        capacity: 25, // Default capacity
        location: serviceRequest.location || 'Online',
      });
    } else {
      return res.status(400).json({ message: 'Invalid service request type' });
    }

    await service.save();

    // Create a ServiceAssignment
    const assignment = new ServiceAssignment({
      requestType: 'ServiceRequest', // Fixed to reference ServiceRequest
      requestId: serviceRequest._id,
      staff: staffIds || [],
    });

    await assignment.save();

    // Update ServiceRequest status
    serviceRequest.status = 'Assigned';
    serviceRequest.staffAssigned = staffIds || [];
    await serviceRequest.save();

    res.status(201).json({ message: 'Service request processed successfully', assignment, service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process service request', error: error.message });
  }
};