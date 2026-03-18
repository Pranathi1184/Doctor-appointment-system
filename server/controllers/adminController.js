import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

// GET /api/admin/users
export async function getUsers(req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return res.json({ users });
}

// GET /api/admin/doctors
export async function getDoctors(req, res) {
  const doctors = await Doctor.find()
    .populate("userId", "name email role")
    .sort({ createdAt: -1 });
  return res.json({ doctors });
}

// POST /api/admin/doctors
export async function createDoctor(req, res) {
  const { name, email, password, specialization, experience, availableSlots } = req.body;

  if (!name || !email || !password || !specialization || experience === undefined) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({ name, email, password, role: "doctor" });
  const doctor = await Doctor.create({
    userId: user._id,
    specialization,
    experience,
    availableSlots: Array.isArray(availableSlots) ? availableSlots : []
  });

  return res.status(201).json({ message: "Doctor created", doctor });
}

// GET /api/admin/appointments
export async function getAllAppointments(req, res) {
  const appointments = await Appointment.find()
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email" }
    })
    .populate({
      path: "patientId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ date: -1 });

  return res.json({ appointments });
}

// DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin user" });

  await Doctor.deleteOne({ userId: user._id });
  await Patient.deleteOne({ userId: user._id });
  await user.deleteOne();

  return res.json({ message: "User deleted" });
}

