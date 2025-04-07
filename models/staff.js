import mongoose from 'mongoose';

// Define and export the counter model
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// Department to numeric code map
const departmentCodes = {
  HR: '01',
  Engineering: '12',
  Accounting: '05',
  Sales: '09',
  Legal: '07',
  Marketing: '03',
};

// Flattened position list for enum
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

const staffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: String,
  position: {
    type: String,
    enum: positionEnum,
    required: true,
  },
  employmentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to generate intelligent staffId
staffSchema.pre("save", async function (next) {
  const staff = this;

  if (!staff.isNew || staff.staffId) return next();

  try {
    const year = String(staff.employmentDate.getFullYear()).slice(-2);
    const deptCode = departmentCodes[staff.department] || '00';
    const counterId = `${year}-${deptCode}`;

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const serial = String(counter.seq).padStart(4, '0');
    staff.staffId = `${year}${deptCode}${serial}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
