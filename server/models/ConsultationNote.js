import mongoose from "mongoose";

const consultationNoteSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true
    },
    diagnosis: { type: String, required: true, trim: true },
    notes: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const ConsultationNote = mongoose.model("ConsultationNote", consultationNoteSchema);
export default ConsultationNote;

