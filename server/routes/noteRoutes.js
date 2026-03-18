import express from "express";
import { createNote, getNoteByAppointment } from "../controllers/noteController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("doctor"), asyncHandler(createNote));
router.get("/:appointmentId", protect, authorize("admin", "doctor", "patient"), asyncHandler(getNoteByAppointment));

export default router;

