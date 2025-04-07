import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  surName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: '' },
  address: String,
  role: {
    type: String,
    enum: ["staff", "client", "student", "admin"],
    default: null,
    required: true,
  },
  country: String,
  state: String,
  city: String,
  verified: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  createdAt: { type: Date, default: Date.now },
});


userSchema.pre("save", async function (next) {
  const user = this;

  if (user.role === "staff" && !user.staff) {
    return next(new Error("Staff role requires a linked Staff record"));
  }
  if (user.staff && user.role !== "staff") {
    return next(new Error("Staff reference requires role to be 'staff'"));
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;