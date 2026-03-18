import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getMyPatientProfile, getPatientById, updateMyPatientProfile } from "../controllers/patientController.js";

const router = express.Router();

router.get("/me", protect, authorize("patient"), asyncHandler(getMyPatientProfile));
router.put("/me", protect, authorize("patient"), asyncHandler(updateMyPatientProfile));
router.get("/:id", protect, authorize("doctor", "admin"), asyncHandler(getPatientById));

export default router;

