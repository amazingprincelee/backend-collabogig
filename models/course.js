import mongoose from 'mongoose';




const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    capacity: { type: Number, required: true, default: 25 },
    location: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now },
})


const Course = mongoose.model('Course', courseSchema);

export default Course;