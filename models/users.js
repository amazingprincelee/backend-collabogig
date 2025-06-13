import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  options: { type: String, default: null }, // Free introductory class or full course enrollement
  password: { type: String, required: true },
  profilePhoto: { type: String, default: "" },
  courseStatus: { type: String, enum: ["free", "paid", "not paid", "pending"], default: "free" },
  walletBalance: { type: Number, default: 0 },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClassGroup" }],
  referralCode: { type: String, unique: true },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Referral' }],
  earnings: { type: Number, default: 0 },
  paymentDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  paymentStatus: {
  type: String,
  enum: ['pending', 'success', 'failed'],
  default: 'pending'
},
  address: String,
  role: {
    type: String,
    enum: ["staff", "client", "student", "partner", "admin"],
    default: null,
    required: true,
  },
  country: String,
  state: String,
  city: String,
  verified: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
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
