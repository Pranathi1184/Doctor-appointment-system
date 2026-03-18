import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

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

  const appointmentDate = new Date(date);
  if (Number.isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    date: appointmentDate,
    status: "booked"
  });

  return res.status(201).json({ message: "Appointment booked", appointment });
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

