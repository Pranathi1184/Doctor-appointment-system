import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    contact: { type: String, required: true, trim: true },
    medicalDetails: {
      bloodGroup: { type: String, trim: true, default: "" },
      allergies: { type: String, trim: true, default: "" },
      conditions: { type: String, trim: true, default: "" },
      notes: { type: String, trim: true, default: "" }
    }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;

