import mongoose from "mongoose";

const doctorBlockSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true }, // store as date-only (00:00)
    reason: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

doctorBlockSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const DoctorBlock = mongoose.model("DoctorBlock", doctorBlockSchema);
export default DoctorBlock;

