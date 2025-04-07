import yup from 'yup';

export const serviceRequestSchema = yup.object().shape({
  title: yup.string().required('Title is required'),

  type: yup
    .string()
    .oneOf(['Project', 'Course'], 'Type must be either "Project" or "Course"')
    .required('Type is required'),

  budget: yup
    .number()
    .typeError('Budget must be a number')
    .positive('Budget must be greater than 0')
    .required('Budget is required'),

  fullName: yup.string().required('Full name is required'),

  email: yup.string().email('Invalid email').required('Email is required'),

  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^\+?[0-9]{7,15}$/, 'Invalid phone number'),

  location: yup.string().nullable(),

  message: yup.string().required('Message is required'),

  status: yup
    .string()
    .oneOf(['Pending', 'Assigned', 'Completed'], 'Invalid status')
    .default('Pending'),

  user: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),

  staffAssigned: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid staff ID format')
    )
    .nullable(),

  isGuest: yup.boolean().default(true),
});
