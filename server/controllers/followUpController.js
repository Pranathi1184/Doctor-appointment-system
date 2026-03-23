import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import FollowUp from "../models/FollowUp.js";
import Patient from "../models/Patient.js";
import { findNextAvailableSlot, isWithinDoctorSlots } from "../utils/schedule.js";

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

async function getPatientForUser(userId) {
  return Patient.findOne({ userId });
}

async function enrichFollowUpWithAvailability(followUp) {
  const appointment = followUp.appointmentId?._id
    ? followUp.appointmentId
    : await Appointment.findById(followUp.appointmentId).populate({
        path: "doctorId",
        select: "specialization experience availableSlots isActive",
        populate: { path: "userId", select: "name email isActive" }
      });

  if (!appointment?.doctorId) return followUp;

  const doctor = appointment.doctorId;
  const recommendedDate = new Date(followUp.recommendedDate);
  if (Number.isNaN(recommendedDate.getTime())) return followUp;

  const hasDerivedAvailability =
    Boolean(followUp.suggestedDate) || Boolean(followUp.systemNote) || followUp.availabilityStatus === "outside";
  if (hasDerivedAvailability) return followUp;

  const { ok } = isWithinDoctorSlots(recommendedDate, doctor.availableSlots || []);
  if (ok) {
    if (!followUp.availabilityStatus) followUp.availabilityStatus = "matched";
    return followUp;
  }

  const nextAvailable = findNextAvailableSlot(recommendedDate, doctor.availableSlots || []);
  followUp.availabilityStatus = nextAvailable ? "outside" : "unavailable";
  followUp.suggestedDate = nextAvailable?.date || null;
  followUp.systemNote = nextAvailable
    ? `Recommended follow-up time is outside the doctor's available timings. Please book at the next available timing: ${nextAvailable.date.toLocaleString()}.`
    : "Recommended follow-up time is outside the doctor's available timings. Please book at the next available timing after the doctor updates their slots.";
  followUp.appointmentId = appointment;

  return followUp;
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
  date.setSeconds(0, 0);

  const { ok } = isWithinDoctorSlots(date, doctor.availableSlots || []);
  let availabilityStatus = "matched";
  let suggestedDate = null;
  let systemNote = "";

  if (!ok) {
    const nextAvailable = findNextAvailableSlot(date, doctor.availableSlots || []);
    availabilityStatus = nextAvailable ? "outside" : "unavailable";
    suggestedDate = nextAvailable?.date || null;
    systemNote = nextAvailable
      ? `Recommended follow-up time is outside the doctor's available timings. Please book at the next available timing: ${nextAvailable.date.toLocaleString()}.`
      : "Recommended follow-up time is outside the doctor's available timings. Please book at the next available timing after the doctor updates their slots.";
  }

  const followUp = await FollowUp.create({
    appointmentId,
    recommendedDate: date,
    notes,
    availabilityStatus,
    suggestedDate,
    systemNote
  });

  const message =
    availabilityStatus === "matched"
      ? "Follow-up added"
      : "Follow-up added. The selected time is outside the doctor's available timings, so a next available timing note was added for the patient.";

  return res.status(201).json({ message, followUp });
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
    .populate({
      path: "appointmentId",
      populate: {
        path: "doctorId",
        select: "specialization experience availableSlots isActive",
        populate: { path: "userId", select: "name email isActive" }
      }
    })
    .sort({ recommendedDate: -1 });

  const enrichedFollowUps = await Promise.all(followUps.map((followUp) => enrichFollowUpWithAvailability(followUp)));

  return res.json({ followUps: enrichedFollowUps });
}

// GET /api/followups/me/reminders
// Patient only: upcoming (next 7 days) + overdue follow-ups
export async function getMyReminders(req, res) {
  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(400).json({ message: "Patient profile not found" });

  const appointments = await Appointment.find({ patientId: patient._id }).select("_id");
  const appointmentIds = appointments.map((a) => a._id);

  const followUps = await FollowUp.find({ appointmentId: { $in: appointmentIds } })
    .populate({
      path: "appointmentId",
      populate: {
        path: "doctorId",
        select: "specialization experience availableSlots isActive",
        populate: { path: "userId", select: "name email isActive" }
      }
    })
    .sort({ recommendedDate: 1 });

  const enrichedFollowUps = await Promise.all(followUps.map((followUp) => enrichFollowUpWithAvailability(followUp)));

  const now = new Date();
  const upcomingUntil = new Date(now);
  upcomingUntil.setDate(upcomingUntil.getDate() + 7);

  const overdue = [];
  const upcoming = [];

  enrichedFollowUps.forEach((f) => {
    const d = new Date(f.recommendedDate);
    if (d < now) overdue.push(f);
    else if (d <= upcomingUntil) upcoming.push(f);
  });

  return res.json({ overdue, upcoming });
}

