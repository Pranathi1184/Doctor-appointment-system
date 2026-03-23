import Doctor from "../models/Doctor.js";

// GET /api/doctors?search=
export async function getDoctors(req, res) {
  const { search } = req.query;

  const filter = { isActive: { $ne: false } };
  if (search) {
    filter.specialization = { $regex: String(search), $options: "i" };
  }

  const doctors = await Doctor.find(filter)
    .populate({
      path: "userId",
      select: "name email isActive",
      match: { isActive: { $ne: false } }
    })
    .sort({ createdAt: -1 });

  return res.json({ doctors: doctors.filter((doctor) => doctor.userId) });
}

// GET /api/doctors/:id
export async function getDoctorById(req, res) {
  const doctor = await Doctor.findOne({ _id: req.params.id, isActive: { $ne: false } }).populate({
    path: "userId",
    select: "name email isActive",
    match: { isActive: { $ne: false } }
  });
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  return res.json({ doctor });
}

