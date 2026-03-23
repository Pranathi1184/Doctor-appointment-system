import express from "express";
import { getMyNotifications, markMyNotificationsRead } from "../controllers/notificationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, authorize("patient", "doctor", "admin"), asyncHandler(getMyNotifications));
router.patch("/me/read-all", protect, authorize("patient", "doctor", "admin"), asyncHandler(markMyNotificationsRead));

export default router;
