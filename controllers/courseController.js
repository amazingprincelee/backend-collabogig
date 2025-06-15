import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CourseTemplate from '../models/courseTemplate.js';
import ClassGroup from '../models/classGroup.js';
import User from '../models/users.js';
import { sendWelcomeWithTempPassword } from '../utils/nodemailer.js';
import { nanoid } from 'nanoid';
import { config } from "dotenv";
config();

const JWT_SECRET = process.env.JWT_SECRET


export const courseEnrollment = async (req, res) => {
  try {
    const { name, email, phone, options, classGroupId } = req.body;

    console.log(options);

    if (!name || !email || !phone || !options || !classGroupId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['free_course', 'paid_course'].includes(options)) {
      return res.status(400).json({ message: 'Invalid enrollment option' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const classGroup = await ClassGroup.findById(classGroupId).populate('courseTemplate');
    if (!classGroup || !classGroup.courseTemplate) {
      return res.status(404).json({ message: 'Class group or course template not found' });
    }

    if (options === 'paid_course' && (!classGroup.courseTemplate.fee || classGroup.courseTemplate.fee <= 0)) {
      return res.status(400).json({ message: 'Invalid or missing course fee' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.courses.includes(classGroup._id)) {
        return res.status(400).json({ message: 'User already enrolled in this class' });
      }

      // Generate JWT token for existing user
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Existing user authenticated, options:', options); // Debug log
      return res.status(200).json({ message: 'User authenticated', token, user: { id: user._id, email, role: user.role }, options });
    }

    // New user registration
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = new User({
      name,
      email,
      phone,
      options,
      password: hashedPassword,
      role: 'student',
      courseStatus: options === 'free_course' ? 'free' : 'not paid',
      paymentStatus: options === 'free_course' ? 'success' : 'pending',
      courses: options === 'free_course' ? [classGroup._id] : [],
      referralCode: nanoid(10),
    });

    await user.save();
    console.log('New user created, options:', options); // Debug log

    // Send welcome email with temp password for both free and paid courses
    await sendWelcomeWithTempPassword(email, name, classGroup.className, tempPassword);

    if (options === 'free_course') {
      classGroup.enrolledUsers.push(user._id);
      await classGroup.save();
    }

    // Generate JWT token for new user
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Redirect to dashboard (frontend will handle payment for paid_course)
    res.status(201).json({ message: 'Registration and authentication successful', token, user: { id: user._id, email, role: user.role }, options });
  } catch (error) {
    console.error('Enrollment error:', error.message);
    return res.status(400).json({ message: 'Enrollment failed', error: error.message });
  }
};

export const createCourseTemplate = async (req, res) => {
  try {
    const { title, description, fee } = req.body;

    if (!title || !description || fee === undefined || fee < 0) {
      return res.status(400).json({ message: 'Title, description, and valid fee are required' });
    }

    const course = new CourseTemplate({ title, description, fee });
    await course.save();

    res.status(201).json({ message: 'Course template created', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};


export const createClassGroup = async (req, res) => {
  try {
    const { courseTemplateId, className, startDate, endDate, capacity, location, learningMode } = req.body;

    const course = await CourseTemplate.findById(courseTemplateId);
    if (!course) return res.status(404).json({ message: 'Course template not found' });

    const classGroup = new ClassGroup({
      courseTemplate: courseTemplateId,
      className,
      startDate,
      endDate,
      capacity,
      location,
      learningMode
    });

    await classGroup.save();
    res.status(201).json({ message: 'Class group created', classGroup });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create class group', error: error.message });
  }
};




export const getAllClassGroups = async (req, res) => {
  try {
    const groups = await ClassGroup.find()
      .populate('courseTemplate', 'title description fee') // Include fee in population
      .populate('enrolledUsers', 'firstName surName email')
      .sort({ startDate: 1 });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch class groups', error: error.message });
  }
};


export const updateCourseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fee } = req.body;

    // Validate input
    if (!title && !description && fee === undefined) {
      return res.status(400).json({ message: 'At least one field (title, description, or fee) must be provided' });
    }
    if (fee !== undefined && (isNaN(fee) || fee < 0)) {
      return res.status(400).json({ message: 'Fee must be a non-negative number' });
    }

    // Find and update the course template
    const course = await CourseTemplate.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course template not found' });
    }

    // Update fields if provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (fee !== undefined) course.fee = fee;

    await course.save();

    res.status(200).json({ message: 'Course template updated', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course template', error: error.message });
  }
};


export const updateClassGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseTemplateId, className, startDate, endDate, capacity, location, learningMode } = req.body;

    // Validate input: at least one field must be provided
    if (
      !courseTemplateId &&
      !className &&
      !startDate &&
      !endDate &&
      capacity === undefined &&
      !location &&
      !learningMode
    ) {
      return res.status(400).json({ message: 'At least one field must be provided' });
    }

    // Find the class group
    const classGroup = await ClassGroup.findById(id);
    if (!classGroup) {
      return res.status(404).json({ message: 'Class group not found' });
    }

    // Validate courseTemplateId if provided
    if (courseTemplateId) {
      const course = await CourseTemplate.findById(courseTemplateId);
      if (!course) {
        return res.status(404).json({ message: 'Course template not found' });
      }
      classGroup.courseTemplate = courseTemplateId;
    }

    // Update fields if provided
    if (className) classGroup.className = className;
    if (startDate) {
      classGroup.startDate = new Date(startDate);
      if (isNaN(classGroup.startDate)) {
        return res.status(400).json({ message: 'Invalid start date' });
      }
    }
    if (endDate) {
      classGroup.endDate = new Date(endDate);
      if (isNaN(classGroup.endDate)) {
        return res.status(400).json({ message: 'Invalid end date' });
      }
    }
    if (capacity !== undefined) {
      if (isNaN(capacity) || capacity < 0) {
        return res.status(400).json({ message: 'Capacity must be a non-negative number' });
      }
      classGroup.capacity = capacity;
    }
    if (location) classGroup.location = location;
    if (learningMode && ['onSite', 'online', 'hybrid'].includes(learningMode)) {
      classGroup.learningMode = learningMode;
    } else if (learningMode) {
      return res.status(400).json({ message: 'Invalid learning mode' });
    }

    // Validate startDate and endDate relationship
    if (classGroup.startDate && classGroup.endDate && classGroup.startDate >= classGroup.endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    await classGroup.save();

    res.status(200).json({ message: 'Class group updated', classGroup });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update class group', error: error.message });
  }
};


export const getClassGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const classGroup = await ClassGroup.findById(id).populate("courseTemplate", "title description fee");
    if (!classGroup) {
      return res.status(404).json({ message: "Class group not found" });
    }
    res.status(200).json(classGroup);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch class group", error: error.message });
  }
};