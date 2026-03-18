import express from "express";
import {
  createDoctor,
  deleteUser,
  getAllAppointments,
  getDoctors,
  getUsers
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", asyncHandler(getUsers));
router.delete("/users/:id", asyncHandler(deleteUser));

router.get("/doctors", asyncHandler(getDoctors));
router.post("/doctors", asyncHandler(createDoctor));

router.get("/appointments", asyncHandler(getAllAppointments));

export default router;

