import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { generateToken } from "../config/generateToken.js";

// POST /api/auth/register
// Public: Patient registration
export async function register(req, res) {
  const { name, email, password, age, gender, contact } = req.body;

  if (!name || !email || !password || age === undefined || !gender || !contact) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({ name, email, password, role: "patient" });
  await Patient.create({ userId: user._id, age, gender, contact });

  return res.status(201).json({
    message: "Registration successful",
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (user.isActive === false) return res.status(403).json({ message: "This account is no longer active." });

  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  return res.json({
    message: "Login successful",
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

// GET /api/auth/me
// Private: returns current user + profile ids (doctorId/patientId)
export async function me(req, res) {
  let patientId = null;
  let doctorId = null;

  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ userId: req.user._id }).select("_id");
    patientId = patient?._id || null;
  }
  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ userId: req.user._id }).select("_id");
    doctorId = doctor?._id || null;
  }

  return res.json({
    user: req.user,
    patientId,
    doctorId
  });
}

