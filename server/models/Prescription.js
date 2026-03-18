import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "ConsultationNote", required: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

prescriptionSchema.index({ noteId: 1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;

