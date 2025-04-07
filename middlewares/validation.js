import { taskValidationSchema } from '../validations/taskValidationSchema.js';
import { milestoneValidationSchema } from '../validations/milestoneValidationSchema.js';
import { registrationSchema, loginSchema } from '../validations/userValidationSchema.js'; 
import { courseSchema } from '../validations/courseValidationSchema.js';
import { contactValidationSchema } from '../validations/contactFormValidationSchema.js'; 
import { paymentSchema } from '../validations/paymentValidationSchema.js';
import { serviceRequestSchema } from '../validations/serviceRequestValidationSchema.js';
import { staffValidationSchema } from '../validations/staffValidationSchema.js';
import { timeValidationSchema } from '../validations/timeValidationSchema.js';
import { notificationValidationSchema } from '../validations/notificationSchema.js';

export const validateTask = async (req, res, next) => {
  try {
    await taskValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Task validation failed',
      errors: error.errors,
    });
  }
};

export const validateMilestone = async (req, res, next) => {
  try {
    await milestoneValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Milestone validation failed',
      errors: error.errors,
    });
  }
};

export const validateRegistration = async (req, res, next) => {
  try {
    await registrationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Registration validation failed',
      errors: error.errors,
    });
  }
};

export const validateLogin = async (req, res, next) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Login validation failed',
      errors: error.errors,
    });
  }
};

export const validateCourse = async (req, res, next) => {
  try {
    await courseSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Course validation failed',
      errors: error.errors,
    });
  }
};

export const validateContact = async (req, res, next) => {
  try {
    await contactValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Contact validation failed',
      errors: error.errors,
    });
  }
};

export const validatePayment = async (req, res, next) => {
  try {
    await paymentSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Payment validation failed',
      errors: error.errors,
    });
  }
};

export const validateServiceRequest = async (req, res, next) => {
  try {
    await serviceRequestSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Service request validation failed',
      errors: error.errors,
    });
  }
};

export const validateStaff = async (req, res, next) => {
  try {
    await staffValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Staff validation failed',
      errors: error.errors,
    });
  }
};

export const validateTime = async (req, res, next) => {
  try {
    await timeValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Time validation failed',
      errors: error.errors,
    });
  }
};



export const validateNotification = async (req, res, next) => {
  try {
    await notificationValidationSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({ message: 'Notification validation failed', errors: error.errors });
  }
};