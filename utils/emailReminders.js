import mongoose from 'mongoose';
import ClassGroup from '../models/classGroup.js';
import User from '../models/users.js';
import { sendCourseStartReminder, sendWeeklyProgressEmail, sendUpgradePromotionEmail } from './nodemailer.js';

// Function to send course start reminders for classes starting today
export const sendCourseStartReminders = async () => {
  try {
    // Get Nigerian time (WAT - West Africa Time, UTC+1)
    const now = new Date();
    const nigerianTime = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // UTC+1
    
    // Set to beginning of day in Nigerian time
    const startOfDay = new Date(nigerianTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day in Nigerian time
    const endOfDay = new Date(nigerianTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find all class groups starting today
    const classGroups = await ClassGroup.find({
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('courseTemplate');
    
    console.log(`Found ${classGroups.length} class groups starting today`);
    
    let remindersSent = 0;
    let errors = 0;
    
    // For each class group, send reminders to all enrolled users
    for (const classGroup of classGroups) {
      // Populate enrolled users
      await ClassGroup.populate(classGroup, { path: 'enrolledUsers' });
      
      // Send reminder to each enrolled user
      for (const userId of classGroup.enrolledUsers) {
        try {
          const user = await User.findById(userId);
          if (!user) continue;
          
          await sendCourseStartReminder(user, classGroup, classGroup.courseTemplate);
          remindersSent++;
        } catch (error) {
          console.error(`Error sending reminder to user ${userId}:`, error);
          errors++;
        }
      }
    }
    
    console.log(`Course start reminders: ${remindersSent} sent, ${errors} errors`);
    return { sent: remindersSent, errors };
  } catch (error) {
    console.error('Error sending course start reminders:', error);
    throw error;
  }
};

// Function to send weekly progress emails on Fridays
export const sendWeeklyProgressEmails = async () => {
  try {
    // Only run on Fridays
    const now = new Date();
    if (now.getDay() !== 5) { // 0 is Sunday, 5 is Friday
      console.log('Not Friday, skipping weekly progress emails');
      return { skipped: true, reason: 'Not Friday' };
    }
    
    // Find all active class groups (where current date is between start and end date)
    const classGroups = await ClassGroup.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('courseTemplate');
    
    console.log(`Found ${classGroups.length} active class groups`);
    
    let emailsSent = 0;
    let errors = 0;
    
    // For each class group, calculate week number and send progress emails
    for (const classGroup of classGroups) {
      // Calculate which week of the course we're in
      const courseStartDate = new Date(classGroup.startDate);
      const courseEndDate = new Date(classGroup.endDate);
      const totalDays = Math.ceil((courseEndDate - courseStartDate) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.ceil(totalDays / 7);
      const daysSinceStart = Math.ceil((now - courseStartDate) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.ceil(daysSinceStart / 7);
      
      // Don't send for the last week
      if (currentWeek >= totalWeeks) {
        console.log(`Skipping last week emails for ${classGroup.className}`);
        continue;
      }
      
      // Get prep links for the current week from the class group
      const currentWeekNumber = Math.ceil((now - new Date(classGroup.startDate)) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      // Filter prep links for the next week
      const prepLinks = classGroup.prepLinks.filter(link => link.weekNumber === currentWeekNumber + 1) || [];
      
      // Populate enrolled users
      await ClassGroup.populate(classGroup, { path: 'enrolledUsers' });
      
      // Send progress email to each enrolled user
      for (const userId of classGroup.enrolledUsers) {
        try {
          const user = await User.findById(userId);
          if (!user) continue;
          
          const result = await sendWeeklyProgressEmail(
            user, 
            classGroup, 
            classGroup.courseTemplate, 
            currentWeek,
            prepLinks
          );
          
          if (!result.skipped) {
            emailsSent++;
          }
        } catch (error) {
          console.error(`Error sending weekly progress email to user ${userId}:`, error);
          errors++;
        }
      }
    }
    
    console.log(`Weekly progress emails: ${emailsSent} sent, ${errors} errors`);
    return { sent: emailsSent, errors };
  } catch (error) {
    console.error('Error sending weekly progress emails:', error);
    throw error;
  }
};

// Function to send promotional emails to free users (only on Wednesdays after first week)
export const sendUpgradePromotionEmails = async () => {
  try {
    // Only run on Wednesdays
    const now = new Date();
    if (now.getDay() !== 3) { // 0 is Sunday, 3 is Wednesday
      console.log('Not Wednesday, skipping upgrade promotion emails');
      return { skipped: true, reason: 'Not Wednesday' };
    }
    
    // Find all users with free course status
    const freeUsers = await User.find({
      courseStatus: 'free',
      role: 'student'
    }).populate({
      path: 'courses',
      populate: {
        path: 'courseTemplate'
      }
    });
    
    console.log(`Found ${freeUsers.length} free users`);
    
    let emailsSent = 0;
    let errors = 0;
    let skippedFirstWeek = 0;
    
    // Get the current week number since the beginning of the year for template rotation
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    
    // Send promotion email to each free user
    for (const user of freeUsers) {
      try {
        // Skip users without any courses
        if (!user.courses || user.courses.length === 0) continue;
        
        // Get the first course for the email
        const classGroup = user.courses[0];
        if (!classGroup || !classGroup.courseTemplate) continue;
        
        // Calculate how many weeks the user has been in the course
        const courseStartDate = new Date(classGroup.startDate);
        const daysSinceStart = Math.ceil((now - courseStartDate) / (1000 * 60 * 60 * 24));
        const weeksSinceStart = Math.ceil(daysSinceStart / 7);
        
        // Skip users in their first week of training
        if (weeksSinceStart <= 1) {
          skippedFirstWeek++;
          continue;
        }
        
        // Send email with the week number for template rotation
        const result = await sendUpgradePromotionEmail(user, classGroup.courseTemplate, weekNumber);
        
        if (!result.skipped) {
          emailsSent++;
        }
      } catch (error) {
        console.error(`Error sending promotion email to user ${user._id}:`, error);
        errors++;
      }
    }
    
    console.log(`Upgrade promotion emails: ${emailsSent} sent, ${errors} errors, ${skippedFirstWeek} skipped (first week)`);
    return { sent: emailsSent, errors, skippedFirstWeek };
  } catch (error) {
    console.error('Error sending upgrade promotion emails:', error);
    throw error;
  }
};