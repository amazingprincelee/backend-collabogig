import * as Yup from 'yup';

// User Registration Schema
const registerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number must be 10 to 15 digits').required('Phone is required'),
});

// Login Schema
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const enrollmentSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10 to 15 digits')
    .required('Phone number is required'),
  options: Yup.string()
    .oneOf(['Free Introductory Class', 'Full Course Enrollment'], 'Invalid option selected')
    .required('Option is required'),
  termsAgreed: Yup.boolean()
    .oneOf([true], 'You must agree to the Terms & Privacy Policy'),
});

// Payment Schema
const paymentSchema = Yup.object().shape({
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  currency: Yup.string().default('NGN'),
});

// Partner Registration Schema
const partnerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number must be 10 to 15 digits'),
});

// Partner Update Schema
const updatePartnerSchema = Yup.object().shape({
  studentReferralPercentage: Yup.number().min(0).max(100).required('Student referral percentage is required'),
  appDevReferralPercentage: Yup.number().min(0).max(100).required('App Dev referral percentage is required'),
});

// App Dev Project Schema
const appDevProjectSchema = Yup.object().shape({
  clientEmail: Yup.string().email('Invalid email').required('Client email is required'),
  projectDetails: Yup.string().required('Project details are required'),
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
});


const createClassGroupSchema = Yup.object().shape({
  courseTemplateId: Yup.string()
    .required('Course template ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid course template ID'),

  className: Yup.string()
    .required('Class name is required')
    .min(3, 'Class name must be at least 3 characters'),

  startDate: Yup.date()
    .required('Start date is required'),

  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date cannot be before start date'),

  capacity: Yup.number()
    .required('Capacity is required')
    .integer('Capacity must be an integer')
    .positive('Capacity must be positive'),

  location: Yup.string()
    .min(2, 'Location must be at least 2 characters')
    .notRequired(),  // or just omit .required()

  learningMode: Yup.string()
    .required('Learning mode is required')
    .oneOf(['online', 'offline', 'hybrid'], 'Invalid learning mode'),
});

 


// Prep Link Schema
const prepLinkSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),

  url: Yup.string()
    .required('URL is required')
    .matches(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      'Must be a valid YouTube URL'
    ),

  description: Yup.string()
    .notRequired()
    .max(500, 'Description cannot exceed 500 characters'),

  weekNumber: Yup.number()
    .required('Week number is required')
    .integer('Week number must be an integer')
    .positive('Week number must be positive')
});

export {
  registerSchema,
  loginSchema,
  paymentSchema,
  partnerSchema,
  updatePartnerSchema,
  appDevProjectSchema,
  enrollmentSchema,
  createClassGroupSchema,
  prepLinkSchema,
};
