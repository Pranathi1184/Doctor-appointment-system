import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

async function getPatientForUser(userId) {
  return Patient.findOne({ userId }).populate("userId", "name email role");
}

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

// GET /api/patients/me
export async function getMyPatientProfile(req, res) {
  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(404).json({ message: "Patient profile not found" });
  return res.json({ patient });
}

// PUT /api/patients/me
export async function updateMyPatientProfile(req, res) {
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) return res.status(404).json({ message: "Patient profile not found" });

  const { age, gender, contact, medicalDetails } = req.body;

  if (age !== undefined) patient.age = age;
  if (gender) patient.gender = gender;
  if (contact) patient.contact = contact;
  if (medicalDetails && typeof medicalDetails === "object") {
    patient.medicalDetails = {
      ...patient.medicalDetails,
      ...medicalDetails
    };
  }

  await patient.save();
  const updated = await getPatientForUser(req.user._id);
  return res.json({ message: "Profile updated", patient: updated });
}

// GET /api/patients/:id
// Doctor/Admin can view. Doctor must have an appointment with that patient.
export async function getPatientById(req, res) {
  const patientId = req.params.id;

  if (req.user.role === "doctor") {
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

    const has = await Appointment.findOne({ doctorId: doctor._id, patientId });
    if (!has) return res.status(403).json({ message: "Forbidden" });
  }

  const patient = await Patient.findById(patientId).populate("userId", "name email role");
  if (!patient) return res.status(404).json({ message: "Patient not found" });

  return res.json({ patient });
}

