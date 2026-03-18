import express from "express";
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments
} from "../controllers/appointmentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("patient"), asyncHandler(createAppointment));
router.get("/patient", protect, authorize("patient"), asyncHandler(getPatientAppointments));
router.get("/doctor", protect, authorize("doctor"), asyncHandler(getDoctorAppointments));

export default router;

