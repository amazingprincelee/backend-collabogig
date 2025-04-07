import yup from 'yup'

export const taskValidationSchema = yup.object({
    title: yup.string().required('Task title is required'),
    description: yup.string(),
    assignedTo: yup.string().required('Assignee is required'), 
    deadline: yup.date().required('Deadline is required'),
    priority: yup.string().oneOf(['Low', 'Medium', 'High']).default('Medium'),
    files: yup.array().of(yup.string()),
  });