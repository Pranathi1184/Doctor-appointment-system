import express from "express";
import { createFollowUp, getFollowUpsByPatient } from "../controllers/followUpController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("doctor"), asyncHandler(createFollowUp));
router.get("/:patientId", protect, authorize("admin", "doctor", "patient"), asyncHandler(getFollowUpsByPatient));

export default router;

