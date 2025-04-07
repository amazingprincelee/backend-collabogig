import Course from '../models/course.js';
import User from '../models/users.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, startDate, endDate, capacity, location } = req.body;

    // Check if admin (optional, based on your needs)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const course = new Course({
      title,
      description,
      startDate,
      endDate,
      capacity,
      location,
    });

    await course.save();

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('enrolledUsers', 'firstName surName email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // From JWT

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check capacity
    if (course.enrolledUsers.length >= course.capacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }

    // Check if already enrolled
    if (course.enrolledUsers.includes(userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.enrolledUsers.push(userId);
    user.courses.push(courseId);

    await course.save();
    await user.save();

    res.status(200).json({ message: 'Enrolled in course successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to enroll in course', error: error.message });
  }
};