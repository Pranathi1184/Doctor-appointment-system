import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import followUpRoutes from "./routes/followUpRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorBlockRoutes from "./routes/doctorBlockRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "doctor-appointments-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor/blocks", doctorBlockRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

