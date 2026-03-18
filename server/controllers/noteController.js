import Appointment from "../models/Appointment.js";
import ConsultationNote from "../models/ConsultationNote.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

async function getPatientForUser(userId) {
  return Patient.findOne({ userId });
}

// POST /api/notes
// Doctor only
export async function createNote(req, res) {
  const { appointmentId, diagnosis, notes } = req.body;
  if (!appointmentId || !diagnosis || !notes) {
    return res.status(400).json({ message: "appointmentId, diagnosis, notes are required" });
  }

  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (String(appointment.doctorId) !== String(doctor._id)) {
    return res.status(403).json({ message: "You can only add notes to your own appointments" });
  }

  const existing = await ConsultationNote.findOne({ appointmentId: appointment._id });
  if (existing) return res.status(400).json({ message: "Consultation note already exists" });

  const note = await ConsultationNote.create({
    appointmentId: appointment._id,
    diagnosis,
    notes
  });

  appointment.status = "completed";
  await appointment.save();

  return res.status(201).json({ message: "Consultation note added", note });
}

// GET /api/notes/:appointmentId
// Patient/Doctor/Admin (must own appointment unless admin)
export async function getNoteByAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });

  if (req.user.role === "doctor") {
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor || String(appointment.doctorId) !== String(doctor._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  } else if (req.user.role === "patient") {
    const patient = await getPatientForUser(req.user._id);
    if (!patient || String(appointment.patientId) !== String(patient._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const note = await ConsultationNote.findOne({ appointmentId: appointment._id });
  return res.json({ note: note || null });
}

