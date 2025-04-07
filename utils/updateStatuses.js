import { ServiceAssignment, ServiceRequest } from '../models/services.js';

const updateStatuses = async () => {
  try {
    const assignments = await ServiceAssignment.find({ status: 'In Progress' });
    for (const assignment of assignments) {
      const allTasksCompleted = assignment.tasks.every(task => task.status === 'Completed');
      if (allTasksCompleted) {
        assignment.status = 'Completed';
        await ServiceRequest.findByIdAndUpdate(assignment.requestId, { status: 'Completed' });
      }
      await assignment.save();
    }
    console.log('Statuses updated successfully');
  } catch (error) {
    console.error('Error updating statuses:', error.message);
    throw error; 
  }
};

export default updateStatuses;