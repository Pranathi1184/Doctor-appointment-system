import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { createNotifications } from "../utils/notifications.js";

function sanitizeRole(role) {
  const allowed = ["admin", "doctor", "patient"];
  return allowed.includes(role) ? role : null;
}

async function deactivateDoctorAccount(doctor) {
  const rawDoctorId = doctor?._id || doctor;
  let populatedDoctor = await Doctor.findById(rawDoctorId).populate("userId");
  if (!populatedDoctor && doctor?.userId) {
    populatedDoctor = doctor;
  }
  if (!populatedDoctor) return false;

  const user =
    typeof populatedDoctor.userId?.save === "function"
      ? populatedDoctor.userId
      : await User.findById(populatedDoctor.userId?._id || populatedDoctor.userId);
  if (!user) return false;

  if (populatedDoctor.isActive === false && user.isActive === false) return true;

  populatedDoctor.isActive = false;
  populatedDoctor.deactivatedAt = new Date();
  await populatedDoctor.save();

  user.isActive = false;
  await user.save();

  const appointments = await Appointment.find({ doctorId: populatedDoctor._id })
    .populate({
      path: "patientId",
      populate: { path: "userId", select: "_id" }
    });

  const patientUserIds = appointments.map((a) => a.patientId?.userId?._id).filter(Boolean);
  const doctorUsers = await User.find({ role: "doctor", isActive: { $ne: false } }).select("_id");
  const message = `${user.name} will no longer be available. Please look for another doctor.`;

  await createNotifications([user._id, ...patientUserIds, ...doctorUsers.map((doctorUser) => doctorUser._id)], message, "warning");
  return true;
}

// GET /api/admin/users
export async function getUsers(req, res) {
  const users = await User.find({
    $or: [
      { role: { $ne: "doctor" } },
      { isActive: { $ne: false } }
    ]
  })
    .select("-password")
    .sort({ createdAt: -1 });
  return res.json({ users });
}

// POST /api/admin/users
// Admin-only: create user for any role (useful for creating additional admins)
export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  const safeRole = sanitizeRole(role);

  if (!name || !email || !password || !safeRole) {
    return res.status(400).json({ message: "name, email, password, role are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({ name, email, password, role: safeRole });

  // Only create profiles when explicitly needed/handled elsewhere.
  // Doctors should be created via /api/admin/doctors (doctor profile required).
  // Patients can self-register via /api/auth/register (patient profile required).

  return res.status(201).json({
    message: "User created",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

// PUT /api/admin/users/:id
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin" && role && role !== "admin") {
    return res.status(400).json({ message: "Cannot change role of an admin user" });
  }

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already in use" });
    user.email = email.toLowerCase();
  }
  if (name) user.name = name;

  if (role) {
    const safeRole = sanitizeRole(role);
    if (!safeRole) return res.status(400).json({ message: "Invalid role" });
    user.role = safeRole;
  }

  await user.save();
  return res.json({ message: "User updated", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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

// PUT /api/admin/doctors/:id
export async function updateDoctor(req, res) {
  const { id } = req.params;
  const { name, email, specialization, experience, availableSlots } = req.body;

  const doctor = await Doctor.findById(id).populate("userId");
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  const user = await User.findById(doctor.userId._id);
  if (!user) return res.status(404).json({ message: "Doctor user not found" });

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already in use" });
    user.email = email.toLowerCase();
  }
  if (name) user.name = name;
  await user.save();

  if (specialization) doctor.specialization = specialization;
  if (experience !== undefined) doctor.experience = experience;
  if (availableSlots !== undefined) {
    doctor.availableSlots = Array.isArray(availableSlots) ? availableSlots : [];
  }
  await doctor.save();

  return res.json({ message: "Doctor updated", doctor });
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

// DELETE /api/admin/doctors/:id
export async function deleteDoctor(req, res) {
  const doctor = await Doctor.findById(req.params.id).populate("userId");
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  await deactivateDoctorAccount(doctor);
  return res.json({ message: "Doctor removed from availability and notifications sent." });
}

// DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin user" });

  const doctor = await Doctor.findOne({ userId: user._id });
  if (doctor) {
    await deactivateDoctorAccount(doctor);
    return res.json({ message: "Doctor removed from availability and notifications sent." });
  }

  await Patient.deleteOne({ userId: user._id });
  await user.deleteOne();

  return res.json({ message: "User deleted" });
}

