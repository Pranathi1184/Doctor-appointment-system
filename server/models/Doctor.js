import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    availableSlots: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;

