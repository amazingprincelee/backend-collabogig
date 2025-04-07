import yup from 'yup';

export const courseSchema = yup.object().shape({
  title: yup.string().required('Course title is required'),
  description: yup.string().required('Course description is required'),
  startDate: yup
    .date()
    .required('Start date is required')
    .typeError('Start date must be a valid date'),
  endDate: yup
    .date()
    .required('End date is required')
    .typeError('End date must be a valid date')
    .min(yup.ref('startDate'), 'End date cannot be before start date'),
  capacity: yup
    .number()
    .required('Capacity is required')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must not exceed 1000'),
  location: yup.string().required('Location is required'),
});
