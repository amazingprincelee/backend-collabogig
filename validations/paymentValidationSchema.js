import  yup from 'yup';

export const paymentSchema = yup.object().shape({
  userName: yup.string().required('User name is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Amount is required'),
  transactionId: yup.string().required('Transaction ID is required'),
  status: yup
    .string()
    .oneOf(['Pending', 'Success', 'Failed'], 'Invalid status')
    .default('Pending'),
  serviceType: yup
    .string()
    .oneOf(['Course', 'Project'], 'Service type must be Course or Project')
    .required('Service type is required'),
  serviceId: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format')
    .required('Service ID is required'),
});
