import express from "express";
import { getDoctors, getDoctorById } from "../controllers/doctorController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getDoctors));
router.get("/:id", asyncHandler(getDoctorById));

export default router;

