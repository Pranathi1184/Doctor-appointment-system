import express from "express";
import { register, login, me } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(me));

export default router;

