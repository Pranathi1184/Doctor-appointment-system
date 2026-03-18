import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { addBlock, deleteBlock, getMyBlocks } from "../controllers/doctorBlockController.js";

const router = express.Router();

router.use(protect, authorize("doctor"));

router.get("/", asyncHandler(getMyBlocks));
router.post("/", asyncHandler(addBlock));
router.delete("/:id", asyncHandler(deleteBlock));

export default router;

