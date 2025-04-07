import yup from 'yup';

const roles = ['staff', 'client', 'student', 'admin'];

// Registration Schema
export const registrationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  surName: yup.string().required('Surname is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?\d{7,15}$/, 'Phone number must be valid'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 6 characters'),
  address: yup.string(),
  role: yup
    .string()
    .oneOf(roles, 'Invalid role')
    .required('Role is required'),
  country: yup.string(),
  state: yup.string(),
  city: yup.string(),
});

// Login Schema
export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});
