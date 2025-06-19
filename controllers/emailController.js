import EmailTemplate from '../models/emailTemplate.js';
import EmailCampaign from '../models/emailCampaign.js';
import User from '../models/users.js';
import ClassGroup from '../models/classGroup.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

// Create transporter with cPanel SMTP settings (reusing from nodemailer.js)
const transporter = nodemailer.createTransport({
  host: 'collabogig.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODE_MAIL_PWDS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
});

// Helper function to format date
const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Helper function to replace template variables
const replaceTemplateVariables = (template, variables) => {
  let content = template;
  
  // Replace standard variables
  if (variables.name) content = content.replace(/\{\{name\}\}/g, variables.name);
  if (variables.email) content = content.replace(/\{\{email\}\}/g, variables.email);
  if (variables.course) content = content.replace(/\{\{course\}\}/g, variables.course);
  if (variables.className) content = content.replace(/\{\{className\}\}/g, variables.className);
  if (variables.startDate) content = content.replace(/\{\{startDate\}\}/g, formatDate(variables.startDate));
  if (variables.endDate) content = content.replace(/\{\{endDate\}\}/g, formatDate(variables.endDate));
  if (variables.currentDate) content = content.replace(/\{\{currentDate\}\}/g, formatDate(variables.currentDate));
  
  // Replace any custom variables
  if (variables.custom) {
    Object.entries(variables.custom).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
  }
  
  return content;
};

// Create a new email template
export const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, description, category, variables } = req.body;
    
    // Check if template with same name exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Template with this name already exists' });
    }
    
    const template = new EmailTemplate({
      name,
      subject,
      body,
      description,
      category,
      variables,
      createdBy: req.user.id
    });
    
    await template.save();
    
    res.status(201).json({
      message: 'Email template created successfully',
      template
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ message: 'Failed to create email template', error: error.message });
  }
};

// Get all email templates
export const getAllEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ message: 'Failed to fetch email templates', error: error.message });
  }
};

// Get email template by ID
export const getEmailTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findById(id)
      .populate('createdBy', 'name email');
    
    if (!template) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ message: 'Failed to fetch email template', error: error.message });
  }
};

// Update email template
export const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, description, category, variables, isActive } = req.body;
    
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    // Check if another template with the same name exists
    if (name && name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({ message: 'Template with this name already exists' });
      }
    }
    
    // Update fields
    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (body) template.body = body;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (variables) template.variables = variables;
    if (isActive !== undefined) template.isActive = isActive;
    
    await template.save();
    
    res.status(200).json({
      message: 'Email template updated successfully',
      template
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ message: 'Failed to update email template', error: error.message });
  }
};

// Delete email template
export const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    // Check if template is used in any campaigns
    const campaignsUsingTemplate = await EmailCampaign.countDocuments({ templateId: id });
    if (campaignsUsingTemplate > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete template as it is used in email campaigns',
        campaignsCount: campaignsUsingTemplate
      });
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ message: 'Failed to delete email template', error: error.message });
  }
};

// Create a new email campaign
export const createEmailCampaign = async (req, res) => {
  try {
    const { 
      name, 
      subject, 
      body, 
      templateId, 
      targetGroups,
      scheduledFor 
    } = req.body;
    
    // Create campaign object
    const campaign = new EmailCampaign({
      name,
      subject,
      body,
      templateId,
      sender: req.user.id,
      targetGroups,
      scheduledFor,
      status: scheduledFor ? 'scheduled' : 'draft'
    });
    
    await campaign.save();
    
    res.status(201).json({
      message: 'Email campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({ message: 'Failed to create email campaign', error: error.message });
  }
};

// Get all email campaigns
export const getAllEmailCampaigns = async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find()
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('templateId', 'name category')
      .populate('targetGroups.classGroups', 'className startDate endDate');
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch email campaigns', error: error.message });
  }
};

// Get email campaign by ID
export const getEmailCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id)
      .populate('sender', 'name email')
      .populate('templateId', 'name category')
      .populate('targetGroups.classGroups', 'className startDate endDate');
    
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching email campaign:', error);
    res.status(500).json({ message: 'Failed to fetch email campaign', error: error.message });
  }
};

// Update email campaign
export const updateEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      subject, 
      body, 
      templateId, 
      targetGroups,
      scheduledFor,
      status 
    } = req.body;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    // Prevent updates to campaigns that are already sent or in progress
    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ message: `Cannot update campaign with status: ${campaign.status}` });
    }
    
    // Update fields
    if (name) campaign.name = name;
    if (subject) campaign.subject = subject;
    if (body) campaign.body = body;
    if (templateId) campaign.templateId = templateId;
    if (targetGroups) campaign.targetGroups = targetGroups;
    if (scheduledFor) campaign.scheduledFor = scheduledFor;
    
    // Update status if provided and valid
    if (status && ['draft', 'scheduled'].includes(status)) {
      campaign.status = status;
    } else if (scheduledFor && campaign.status === 'draft') {
      campaign.status = 'scheduled';
    }
    
    await campaign.save();
    
    res.status(200).json({
      message: 'Email campaign updated successfully',
      campaign
    });
  } catch (error) {
    console.error('Error updating email campaign:', error);
    res.status(500).json({ message: 'Failed to update email campaign', error: error.message });
  }
};

// Delete email campaign
export const deleteEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    // Prevent deletion of campaigns that are already sent or in progress
    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ message: `Cannot delete campaign with status: ${campaign.status}` });
    }
    
    await campaign.deleteOne();
    
    res.status(200).json({
      message: 'Email campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email campaign:', error);
    res.status(500).json({ message: 'Failed to delete email campaign', error: error.message });
  }
};

// Prepare recipients for a campaign
export const prepareEmailCampaignRecipients = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    // Prevent preparing recipients for campaigns that are already sent or in progress
    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ message: `Cannot prepare recipients for campaign with status: ${campaign.status}` });
    }
    
    // Build query based on target groups
    let userQuery = { role: 'student' };
    
    // Filter by course status if specified
    if (campaign.targetGroups.courseStatus && campaign.targetGroups.courseStatus.length > 0) {
      userQuery.courseStatus = { $in: campaign.targetGroups.courseStatus };
    }
    
    // Filter by class groups if specified
    let userIds = [];
    if (campaign.targetGroups.classGroups && campaign.targetGroups.classGroups.length > 0) {
      const classGroups = await ClassGroup.find({
        _id: { $in: campaign.targetGroups.classGroups }
      }).populate('enrolledUsers');
      
      // Extract all user IDs from the class groups
      userIds = classGroups.reduce((ids, group) => {
        return [...ids, ...group.enrolledUsers.map(user => user._id)];
      }, []);
      
      // If both course status and class groups are specified, we need to find the intersection
      if (campaign.targetGroups.courseStatus && campaign.targetGroups.courseStatus.length > 0) {
        userQuery._id = { $in: userIds };
      } else {
        // If only class groups are specified, we can just use the user IDs
        userQuery = { _id: { $in: userIds } };
      }
    }
    
    // Find all users matching the criteria
    const users = await User.find(userQuery).select('name email');
    
    // Create recipient objects
    const recipients = users.map(user => ({
      user: user._id,
      email: user.email,
      name: user.name,
      status: 'pending'
    }));
    
    // Update campaign with recipients
    campaign.recipients = recipients;
    campaign.stats.total = recipients.length;
    await campaign.save();
    
    res.status(200).json({
      message: 'Email campaign recipients prepared successfully',
      recipientsCount: recipients.length
    });
  } catch (error) {
    console.error('Error preparing email campaign recipients:', error);
    res.status(500).json({ message: 'Failed to prepare email campaign recipients', error: error.message });
  }
};

// Send test email
export const sendTestEmail = async (req, res) => {
  try {
    const { email, subject, body, variables } = req.body;
    
    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    
    // Replace template variables if provided
    const processedBody = variables ? replaceTemplateVariables(body, variables) : body;
    
    // Send email
    const mailOptions = {
      from: process.env.NODE_MAIL_USER,
      to: email,
      subject,
      html: processedBody
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
};

// Send email campaign
export const sendEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    // Check if campaign has recipients
    if (!campaign.recipients || campaign.recipients.length === 0) {
      return res.status(400).json({ message: 'Campaign has no recipients. Please prepare recipients first.' });
    }
    
    // Prevent sending campaigns that are already sent or in progress
    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ message: `Cannot send campaign with status: ${campaign.status}` });
    }
    
    // Update campaign status
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    await campaign.save();
    
    // Start sending emails asynchronously
    res.status(200).json({
      message: 'Email campaign sending started',
      recipientsCount: campaign.recipients.length
    });
    
    // Process emails in batches to avoid overwhelming the server
    const batchSize = 50;
    const batches = Math.ceil(campaign.recipients.length / batchSize);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, campaign.recipients.length);
      const batch = campaign.recipients.slice(start, end);
      
      // Process each recipient in the batch
      const promises = batch.map(async (recipient, index) => {
        try {
          // Skip already sent emails
          if (recipient.status === 'sent') return;
          
          // Get user data for variable replacement
          const user = await User.findById(recipient.user).populate({
            path: 'courses',
            populate: {
              path: 'courseTemplate'
            }
          });
          
          // Prepare variables for template
          const variables = {
            name: recipient.name || user?.name || '',
            email: recipient.email,
            currentDate: new Date()
          };
          
          // Add course information if available
          if (user?.courses && user.courses.length > 0) {
            const course = user.courses[0];
            variables.course = course.courseTemplate?.title || '';
            variables.className = course.className || '';
            variables.startDate = course.startDate;
            variables.endDate = course.endDate;
          }
          
          // Replace template variables
          const processedBody = replaceTemplateVariables(campaign.body, variables);
          
          // Send email
          const mailOptions = {
            from: process.env.NODE_MAIL_USER,
            to: recipient.email,
            subject: campaign.subject,
            html: processedBody
          };
          
          await transporter.sendMail(mailOptions);
          
          // Update recipient status
          recipient.status = 'sent';
          recipient.sentAt = new Date();
          successCount++;
          
          // Add a small delay to prevent overwhelming the mail server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error);
          recipient.status = 'failed';
          recipient.error = error.message;
          failureCount++;
        }
      });
      
      await Promise.all(promises);
      
      // Update campaign in database every batch to save progress
      campaign.stats.sent = successCount;
      campaign.stats.failed = failureCount;
      await campaign.save();
    }
    
    // Update final campaign status
    campaign.status = 'completed';
    await campaign.save();
    
    console.log(`Email campaign completed: ${successCount} sent, ${failureCount} failed`);
  } catch (error) {
    console.error('Error sending email campaign:', error);
    
    // Update campaign status to failed
    try {
      const campaign = await EmailCampaign.findById(req.params.id);
      if (campaign) {
        campaign.status = 'failed';
        await campaign.save();
      }
    } catch (updateError) {
      console.error('Error updating campaign status:', updateError);
    }
  }
};

// Get campaign statistics
export const getEmailCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Email campaign not found' });
    }
    
    res.status(200).json({
      campaignId: campaign._id,
      name: campaign.name,
      status: campaign.status,
      stats: campaign.stats,
      sentAt: campaign.sentAt,
      scheduledFor: campaign.scheduledFor,
      createdAt: campaign.createdAt
    });
  } catch (error) {
    console.error('Error fetching email campaign stats:', error);
    res.status(500).json({ message: 'Failed to fetch email campaign stats', error: error.message });
  }
};