import express from "express";

import { adminOnly, protect } from "../middleware/authMiddleware.js";

import { createUser, getUsers, getUserById } from "../controllers/userController.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", protect, adminOnly, asyncHandler(getUsers));
router.post("/", protect, adminOnly, asyncHandler(createUser));
router.get("/:id", protect, asyncHandler(getUserById));

export default router;
