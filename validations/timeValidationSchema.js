import yup from 'yup';

export const timeValidationSchema = yup.object({
  hours: yup.number().required('Hours is required').min(0, 'Hours cannot be negative'),
});

