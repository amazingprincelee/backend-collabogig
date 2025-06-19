import * as Yup from 'yup';

// Email Template Schema
export const emailTemplateSchema = Yup.object().shape({
  name: Yup.string()
    .required('Template name is required')
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name cannot exceed 100 characters'),
  
  subject: Yup.string()
    .required('Email subject is required')
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  
  body: Yup.string()
    .required('Email body is required')
    .min(10, 'Body must be at least 10 characters'),
  
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters'),
  
  category: Yup.string()
    .required('Category is required')
    .oneOf(
      ['announcement', 'reminder', 'promotion', 'general', 'custom'],
      'Invalid category'
    ),
  
  variables: Yup.array()
    .of(Yup.string())
    .notRequired(),
  
  isActive: Yup.boolean()
    .notRequired()
});

// Email Campaign Schema
export const emailCampaignSchema = Yup.object().shape({
  name: Yup.string()
    .required('Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name cannot exceed 100 characters'),
  
  subject: Yup.string()
    .required('Email subject is required')
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  
  body: Yup.string()
    .required('Email body is required')
    .min(10, 'Body must be at least 10 characters'),
  
  templateId: Yup.string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid template ID')
    .notRequired(),
  
  targetGroups: Yup.object().shape({
    classGroups: Yup.array()
      .of(
        Yup.string()
          .matches(/^[0-9a-fA-F]{24}$/, 'Invalid class group ID')
      )
      .notRequired(),
    
    courseStatus: Yup.array()
      .of(
        Yup.string()
          .oneOf(['free', 'paid', 'not paid', 'pending'], 'Invalid course status')
      )
      .notRequired()
  }),
  
  scheduledFor: Yup.date()
    .min(
      new Date(),
      'Scheduled date must be in the future'
    )
    .notRequired()
});

// Test Email Schema
export const testEmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email address is required'),
  
  subject: Yup.string()
    .required('Email subject is required')
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  
  body: Yup.string()
    .required('Email body is required')
    .min(10, 'Body must be at least 10 characters'),
  
  variables: Yup.object()
    .notRequired()
});