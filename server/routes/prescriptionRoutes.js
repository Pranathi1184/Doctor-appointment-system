import express from "express";
import {
  createPrescription,
  getPrescriptionsByPatient
} from "../controllers/prescriptionController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("doctor"), asyncHandler(createPrescription));
router.get(
  "/:patientId",
  protect,
  authorize("admin", "doctor", "patient"),
  asyncHandler(getPrescriptionsByPatient)
);

export default router;

