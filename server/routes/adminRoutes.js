import express from "express";
import {
  createDoctor,
  createUser,
  deleteDoctor,
  deleteUser,
  getAllAppointments,
  getDoctors,
  getUsers,
  updateDoctor,
  updateUser
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", asyncHandler(getUsers));
router.post("/users", asyncHandler(createUser));
router.put("/users/:id", asyncHandler(updateUser));
router.delete("/users/:id", asyncHandler(deleteUser));

router.get("/doctors", asyncHandler(getDoctors));
router.post("/doctors", asyncHandler(createDoctor));
router.put("/doctors/:id", asyncHandler(updateDoctor));
router.delete("/doctors/:id", asyncHandler(deleteDoctor));

router.get("/appointments", asyncHandler(getAllAppointments));

export default router;

