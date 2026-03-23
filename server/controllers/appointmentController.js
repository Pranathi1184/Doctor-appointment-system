import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import DoctorBlock from "../models/DoctorBlock.js";
import { isWithinDoctorSlots } from "../utils/schedule.js";

function startOfDay(dateObj) {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function ensureDoctorNotBlocked(doctorId, dateObj) {
  const day = startOfDay(dateObj);
  const exists = await DoctorBlock.findOne({ doctorId, date: day });
  return !exists;
}

async function getPatientForUser(userId) {
  return Patient.findOne({ userId });
}

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

// POST /api/appointments
// Patient only
export async function createAppointment(req, res) {
  const { doctorId, date } = req.body;
  if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date are required" });

  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(400).json({ message: "Patient profile not found" });

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  if (doctor.isActive === false) {
    return res.status(400).json({ message: "This doctor is no longer available. Please choose another doctor." });
  }

  const appointmentDate = new Date(date);
  if (Number.isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }
  // Normalize: datetime-local has no seconds; keep DB consistent
  appointmentDate.setSeconds(0, 0);

  const notBlocked = await ensureDoctorNotBlocked(doctor._id, appointmentDate);
  if (!notBlocked) {
    return res.status(400).json({ message: "Doctor is on leave / not available for the selected date." });
  }

  const { ok, parsedSlots } = isWithinDoctorSlots(appointmentDate, doctor.availableSlots || []);
  if (!ok) {
    const slotsText = parsedSlots.length ? parsedSlots.map((s) => s.label).join(", ") : "No slots configured";
    return res.status(400).json({
      message: `Doctor is not available at the selected time. Available slots: ${slotsText}`
    });
  }

  const conflict = await Appointment.findOne({
    doctorId: doctor._id,
    date: appointmentDate,
    status: { $ne: "cancelled" }
  });
  if (conflict) {
    return res.status(400).json({ message: "This time is already booked. Please choose another slot." });
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    date: appointmentDate,
    status: "booked"
  });

  return res.status(201).json({ message: "Appointment booked", appointment });
}

// PATCH /api/appointments/:id/cancel
// Patient only (own appointment)
export async function cancelAppointment(req, res) {
  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(400).json({ message: "Patient profile not found" });

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (String(appointment.patientId) !== String(patient._id)) return res.status(403).json({ message: "Forbidden" });

  if (appointment.status === "completed") {
    return res.status(400).json({ message: "Completed appointments cannot be cancelled." });
  }
  appointment.status = "cancelled";
  await appointment.save();

  return res.json({ message: "Appointment cancelled", appointment });
}

// PATCH /api/appointments/:id/reschedule
// Patient only (own appointment)
export async function rescheduleAppointment(req, res) {
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: "date is required" });

  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(400).json({ message: "Patient profile not found" });

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  if (String(appointment.patientId) !== String(patient._id)) return res.status(403).json({ message: "Forbidden" });

  if (appointment.status !== "booked") {
    return res.status(400).json({ message: "Only booked appointments can be rescheduled." });
  }

  const doctor = await Doctor.findById(appointment.doctorId);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  if (doctor.isActive === false) {
    return res.status(400).json({ message: "This doctor is no longer available. Please choose another doctor." });
  }

  const newDate = new Date(date);
  if (Number.isNaN(newDate.getTime())) return res.status(400).json({ message: "Invalid date" });
  newDate.setSeconds(0, 0);

  const notBlocked = await ensureDoctorNotBlocked(doctor._id, newDate);
  if (!notBlocked) {
    return res.status(400).json({ message: "Doctor is on leave / not available for the selected date." });
  }

  const { ok, parsedSlots } = isWithinDoctorSlots(newDate, doctor.availableSlots || []);
  if (!ok) {
    const slotsText = parsedSlots.length ? parsedSlots.map((s) => s.label).join(", ") : "No slots configured";
    return res.status(400).json({
      message: `Doctor is not available at the selected time. Available slots: ${slotsText}`
    });
  }

  const conflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: doctor._id,
    date: newDate,
    status: { $ne: "cancelled" }
  });
  if (conflict) {
    return res.status(400).json({ message: "This time is already booked. Please choose another slot." });
  }

  appointment.date = newDate;
  await appointment.save();

  return res.json({ message: "Appointment rescheduled", appointment });
}

// GET /api/appointments/patient
export async function getPatientAppointments(req, res) {
  const patient = await getPatientForUser(req.user._id);
  if (!patient) return res.status(400).json({ message: "Patient profile not found" });

  const appointments = await Appointment.find({ patientId: patient._id })
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ date: -1 });

  return res.json({ appointments });
}

// GET /api/appointments/doctor
export async function getDoctorAppointments(req, res) {
  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const appointments = await Appointment.find({ doctorId: doctor._id })
    .populate({
      path: "patientId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ date: -1 });

  return res.json({ appointments });
}

