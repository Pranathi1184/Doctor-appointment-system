import Doctor from "../models/Doctor.js";
import DoctorBlock from "../models/DoctorBlock.js";

async function getDoctorForUser(userId) {
  return Doctor.findOne({ userId });
}

function parseDateOnly(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/doctor/blocks
export async function getMyBlocks(req, res) {
  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const blocks = await DoctorBlock.find({ doctorId: doctor._id }).sort({ date: 1 });
  return res.json({ blocks });
}

// POST /api/doctor/blocks
export async function addBlock(req, res) {
  const { date, reason } = req.body;
  const dateOnly = parseDateOnly(date);
  if (!dateOnly) return res.status(400).json({ message: "Valid date is required" });

  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const block = await DoctorBlock.create({
    doctorId: doctor._id,
    date: dateOnly,
    reason: reason || ""
  });

  return res.status(201).json({ message: "Leave/blocked day added", block });
}

// DELETE /api/doctor/blocks/:id
export async function deleteBlock(req, res) {
  const doctor = await getDoctorForUser(req.user._id);
  if (!doctor) return res.status(400).json({ message: "Doctor profile not found" });

  const block = await DoctorBlock.findById(req.params.id);
  if (!block) return res.status(404).json({ message: "Blocked day not found" });
  if (String(block.doctorId) !== String(doctor._id)) return res.status(403).json({ message: "Forbidden" });

  await block.deleteOne();
  return res.json({ message: "Blocked day removed" });
}

