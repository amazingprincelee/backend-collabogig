import Project from '../models/projects.js';
import { ServiceRequest } from '../models/services.js'; // Assuming this exists

export const createProjectFromRequest = async (req, res) => {
  try {
    const { serviceRequestId } = req.body;

    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest || serviceRequest.type !== 'Project') {
      return res.status(404).json({ message: 'Valid project service request not found' });
    }

    const project = new Project({
      title: serviceRequest.title,
      description: serviceRequest.message, // Using message as description
      startDate: new Date(), // Adjust as needed
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days
      budget: serviceRequest.budget,
      location: serviceRequest.location || 'Remote',
    });

    await project.save();

    // Update service request status
    serviceRequest.status = 'Assigned';
    await serviceRequest.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('assignedUsers', 'firstName surName email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedUsers', 'firstName surName email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};