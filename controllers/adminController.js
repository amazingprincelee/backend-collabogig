import { ServiceRequest, ServiceAssignment } from '../models/services.js';
import ClassGroup from '../models/classGroup.js';
import CourseTemplate from '../models/courseTemplate.js';
import User from '../models/users.js';
import mongoose from 'mongoose';

// Assign staff to a service request
export const assignStaffToRequest = async (req, res) => {
  //frontend request
  // How to make request to assign multiple staff to a project

  // {
  //     "_id": "661234abcd56789",
  //     "requestType": "Project",
  //     "requestId": "660f9999bcde123",
  //     "staff": ["6601aa11223344", "6601aa22334455"],
  //     "assignedAt": "2025-04-06T10:00:00Z",
  //     "status": "In Progress"
  //   }

  const { requestId, staffIds } = req.body; // staffIds = array of ObjectIds

  try {
    // 1. Create ServiceAssignment
    const assignment = await ServiceAssignment.create({
      requestType: 'Project', // or 'Course'
      requestId,
      staff: staffIds,
    });

    // 2. Update the ServiceRequest to reflect assignment
    await Service.findByIdAndUpdate(requestId, {
      status: 'Assigned',
      staffAssigned: staffIds, // optional, for easy querying
    });

    res.status(200).json({ message: 'Staff assigned successfully', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to assign staff' });
  }
};

// Get all course templates and class groups for admin dashboard
export const getCourseManagementData = async (req, res) => {
  try {
    const courseTemplates = await CourseTemplate.find().sort({ createdAt: -1 });
    const classGroups = await ClassGroup.find()
      .populate('courseTemplate', 'title description fee')
      .populate('enrolledUsers', 'name email courseStatus')
      .sort({ startDate: 1 });

    res.status(200).json({
      courseTemplates,
      classGroups
    });
  } catch (error) {
    console.error('Error fetching course management data:', error);
    res.status(500).json({ message: 'Failed to fetch course management data', error: error.message });
  }
};

// Get detailed analytics for a specific class group
export const getClassGroupAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classGroup = await ClassGroup.findById(id)
      .populate('courseTemplate')
      .populate('enrolledUsers');
      
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }
    
    // Calculate analytics
    const totalStudents = classGroup.enrolledUsers.length;
    const paidStudents = classGroup.enrolledUsers.filter(user => user.courseStatus === 'paid').length;
    const freeStudents = classGroup.enrolledUsers.filter(user => user.courseStatus === 'free').length;
    const pendingStudents = classGroup.enrolledUsers.filter(user => user.courseStatus === 'pending' || user.courseStatus === 'not paid').length;
    
    // Calculate course progress
    const now = new Date();
    const startDate = new Date(classGroup.startDate);
    const endDate = new Date(classGroup.endDate);
    const totalDuration = endDate - startDate;
    let progress = 0;
    
    if (now < startDate) {
      progress = 0;
    } else if (now > endDate) {
      progress = 100;
    } else {
      progress = Math.round(((now - startDate) / totalDuration) * 100);
    }
    
    res.status(200).json({
      classGroup,
      analytics: {
        totalStudents,
        paidStudents,
        freeStudents,
        pendingStudents,
        progress,
        occupancyRate: Math.round((totalStudents / classGroup.capacity) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching class group analytics:', error);
    res.status(500).json({ message: 'Failed to fetch class group analytics', error: error.message });
  }
};

// Toggle prep links access for free users
export const togglePrepLinksAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle the canReceivePrepLinks field
    user.canReceivePrepLinks = !user.canReceivePrepLinks;
    await user.save();
    
    res.status(200).json({
      message: `Prep links access ${user.canReceivePrepLinks ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        courseStatus: user.courseStatus,
        canReceivePrepLinks: user.canReceivePrepLinks
      }
    });
  } catch (error) {
    console.error('Error toggling prep links access:', error);
    res.status(500).json({ message: 'Failed to toggle prep links access', error: error.message });
  }
};

// Add prep links to a class group
export const addPrepLinks = async (req, res) => {
  try {
    const { classGroupId } = req.params;
    const { title, url, description, weekNumber } = req.body;
    
    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }
    
    // Create new prep link
    const newPrepLink = {
      title,
      url,
      description,
      weekNumber,
      uploadedAt: new Date()
    };
    
    // Add to class group's prepLinks array
    classGroup.prepLinks.push(newPrepLink);
    await classGroup.save();
    
    res.status(201).json({
      message: 'Prep link added successfully',
      prepLink: newPrepLink
    });
  } catch (error) {
    console.error('Error adding prep link:', error);
    res.status(500).json({ message: 'Failed to add prep link', error: error.message });
  }
};

// Get all prep links for a class group
export const getPrepLinks = async (req, res) => {
  try {
    const { classGroupId } = req.params;
    
    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }
    
    // Sort prep links by week number
    const prepLinks = classGroup.prepLinks.sort((a, b) => a.weekNumber - b.weekNumber);
    
    res.status(200).json({
      classGroupId,
      className: classGroup.className,
      prepLinks
    });
  } catch (error) {
    console.error('Error fetching prep links:', error);
    res.status(500).json({ message: 'Failed to fetch prep links', error: error.message });
  }
};

// Update a prep link
export const updatePrepLink = async (req, res) => {
  try {
    const { classGroupId, prepLinkId } = req.params;
    const { title, url, description, weekNumber } = req.body;
    
    // Validate YouTube URL if provided
    if (url) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(url)) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
    }
    
    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }
    
    // Find the prep link to update
    const prepLinkIndex = classGroup.prepLinks.findIndex(link => link._id.toString() === prepLinkId);
    if (prepLinkIndex === -1) {
      return res.status(404).json({ message: 'Prep link not found' });
    }
    
    // Update the prep link
    if (title) classGroup.prepLinks[prepLinkIndex].title = title;
    if (url) classGroup.prepLinks[prepLinkIndex].url = url;
    if (description !== undefined) classGroup.prepLinks[prepLinkIndex].description = description;
    if (weekNumber) classGroup.prepLinks[prepLinkIndex].weekNumber = weekNumber;
    
    await classGroup.save();
    
    res.status(200).json({
      message: 'Prep link updated successfully',
      prepLink: classGroup.prepLinks[prepLinkIndex]
    });
  } catch (error) {
    console.error('Error updating prep link:', error);
    res.status(500).json({ message: 'Failed to update prep link', error: error.message });
  }
};

// Delete a prep link
export const deletePrepLink = async (req, res) => {
  try {
    const { classGroupId, prepLinkId } = req.params;
    
    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }
    
    // Find and remove the prep link
    const initialLength = classGroup.prepLinks.length;
    classGroup.prepLinks = classGroup.prepLinks.filter(link => link._id.toString() !== prepLinkId);
    
    if (classGroup.prepLinks.length === initialLength) {
      return res.status(404).json({ message: 'Prep link not found' });
    }
    
    await classGroup.save();
    
    res.status(200).json({
      message: 'Prep link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prep link:', error);
    res.status(500).json({ message: 'Failed to delete prep link', error: error.message });
  }
};

