import { Service, ServiceAssignment } from '../models/services.js';



    

export const assignStaffToRequest =  async (req, res) => {
   

    //frontend request
   // How to make request to assign multiple staff to a project

    // {
    //     "_id": "661234abcd56789",
    //     "requestType": "Project",
    //     "requestId": "660f9999bcde123",
    //     "staff": ["6601aa11223344", "6601aa22334455"],
    //     "assignedAt": "2025-04-06T10:00:00Z",
    //     "status": "In Progress"
    //   }
      


  const { requestId, staffIds } = req.body; // staffIds = array of ObjectIds

  try {
    // 1. Create ServiceAssignment
    const assignment = await ServiceAssignment.create({
      requestType: 'Project', // or 'Course'
      requestId,
      staff: staffIds,
    });

    // 2. Update the ServiceRequest to reflect assignment
    await Service.findByIdAndUpdate(requestId, {
      status: 'Assigned',
      staffAssigned: staffIds, // optional, for easy querying
    });

    res.status(200).json({ message: 'Staff assigned successfully', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to assign staff' });
  }
};

