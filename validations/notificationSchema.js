import yup from 'yup';

export const notificationValidationSchema = yup.object().shape({
  recipient: yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid recipient ID').required('Recipient is required'),
  message: yup.string().required('Message is required'),
  type: yup.string().oneOf(['Email', 'InApp'], 'Type must be Email or InApp').required('Type is required'),
});