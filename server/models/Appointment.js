import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked" }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;

