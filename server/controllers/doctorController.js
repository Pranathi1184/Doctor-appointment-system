import Doctor from "../models/Doctor.js";

// GET /api/doctors?search=
export async function getDoctors(req, res) {
  const { search } = req.query;

  const filter = {};
  if (search) {
    filter.specialization = { $regex: String(search), $options: "i" };
  }

  const doctors = await Doctor.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return res.json({ doctors });
}

// GET /api/doctors/:id
export async function getDoctorById(req, res) {
  const doctor = await Doctor.findById(req.params.id).populate("userId", "name email");
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  return res.json({ doctor });
}

