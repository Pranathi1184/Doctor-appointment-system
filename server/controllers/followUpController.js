import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import FollowUp from "../models/FollowUp.js";
import Patient from "../models/Patient.js";

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

async function getPatientForUser(userId) {
  return Patient.findOne({ userId });
}

// POST /api/followups
// Doctor only
export async function createFollowUp(req, res) {
  const { appointmentId, recommendedDate, notes } = req.body;
  if (!appointmentId || !recommendedDate || !notes) {
    return res.status(400).json({ message: "appointmentId, recommendedDate, notes are required" });
  }

  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (String(appointment.doctorId) !== String(doctor._id)) return res.status(403).json({ message: "Forbidden" });

  const date = new Date(recommendedDate);
  if (Number.isNaN(date.getTime())) return res.status(400).json({ message: "Invalid recommendedDate" });

  const followUp = await FollowUp.create({
    appointmentId,
    recommendedDate: date,
    notes
  });

  return res.status(201).json({ message: "Follow-up added", followUp });
}

// GET /api/followups/:patientId
export async function getFollowUpsByPatient(req, res) {
  const { patientId } = req.params;

  if (req.user.role === "patient") {
    const me = await getPatientForUser(req.user._id);
    if (!me || String(me._id) !== String(patientId)) return res.status(403).json({ message: "Forbidden" });
  }

  const appointments = await Appointment.find({ patientId }).select("_id");
  const appointmentIds = appointments.map((a) => a._id);

  const followUps = await FollowUp.find({ appointmentId: { $in: appointmentIds } })
    .populate("appointmentId")
    .sort({ recommendedDate: -1 });

  return res.json({ followUps });
}

