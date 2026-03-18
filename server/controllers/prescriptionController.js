import Appointment from "../models/Appointment.js";
import ConsultationNote from "../models/ConsultationNote.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

async function getPatientForUser(userId) {
  return Patient.findOne({ userId });
}

// POST /api/prescriptions
// Doctor only
export async function createPrescription(req, res) {
  const { noteId, medicineName, dosage, duration, instructions } = req.body;
  if (!noteId || !medicineName || !dosage || !duration || !instructions) {
    return res.status(400).json({ message: "All prescription fields are required" });
  }

  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const note = await ConsultationNote.findById(noteId);
  if (!note) return res.status(404).json({ message: "Consultation note not found" });

  const appointment = await Appointment.findById(note.appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (String(appointment.doctorId) !== String(doctor._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const prescription = await Prescription.create({
    noteId,
    medicineName,
    dosage,
    duration,
    instructions
  });

  return res.status(201).json({ message: "Prescription added", prescription });
}

// GET /api/prescriptions/:patientId
export async function getPrescriptionsByPatient(req, res) {
  const { patientId } = req.params;

  if (req.user.role === "patient") {
    const me = await getPatientForUser(req.user._id);
    if (!me || String(me._id) !== String(patientId)) return res.status(403).json({ message: "Forbidden" });
  }

  const appointments = await Appointment.find({ patientId }).select("_id");
  const appointmentIds = appointments.map((a) => a._id);

  const notes = await ConsultationNote.find({ appointmentId: { $in: appointmentIds } }).select("_id");
  const noteIds = notes.map((n) => n._id);

  const prescriptions = await Prescription.find({ noteId: { $in: noteIds } })
    .populate({
      path: "noteId",
      populate: { path: "appointmentId" }
    })
    .sort({ createdAt: -1 });

  return res.json({ prescriptions });
}

