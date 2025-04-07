import yup from 'yup';


export const milestoneValidationSchema = yup.object({
    title: yup.string().required('Milestone title is required'),
    description: yup.string(),
    dueDate: yup.date().required('Due date is required'),
  });