import express from "express";
import { createFollowUp, getFollowUpsByPatient, getMyReminders } from "../controllers/followUpController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("doctor"), asyncHandler(createFollowUp));
router.get("/me/reminders", protect, authorize("patient"), asyncHandler(getMyReminders));
router.get("/:patientId", protect, authorize("admin", "doctor", "patient"), asyncHandler(getFollowUpsByPatient));

export default router;

