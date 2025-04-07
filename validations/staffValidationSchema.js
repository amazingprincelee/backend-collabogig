import yup from 'yup'

;


const departmentOptions = ['HR', 'Engineering', 'Accounting', 'Sales', 'Legal', 'Marketing'];

const positionEnum = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Social Media Manager',
  'Operations Manager',
  'UX/UI Designer',
  'Cybersecurity Specialist',
  'Technical Trainer',
  'Software Engineering Intern',
  'Frontend Development Intern',
  'Backend Development Intern',
  'Digital Marketing Intern',
  'Social Media Manager',
];

export const staffValidationSchema = yup.object().shape({
  department: yup
    .string()
    .oneOf(departmentOptions, 'Invalid department')
    .required('Department is required'),
  position: yup
    .string()
    .oneOf(positionEnum, 'Invalid position')
    .required('Position is required'),
  employmentDate: yup
    .date()
    .required('Employment date is required')
    .typeError('Employment date must be a valid date'),
});