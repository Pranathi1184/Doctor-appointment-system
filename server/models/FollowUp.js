import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    recommendedDate: { type: Date, required: true },
    notes: { type: String, required: true, trim: true },
    availabilityStatus: { type: String, enum: ["matched", "outside", "unavailable"], default: "matched" },
    suggestedDate: { type: Date, default: null },
    systemNote: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

followUpSchema.index({ appointmentId: 1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);
export default FollowUp;

