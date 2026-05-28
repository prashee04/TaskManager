import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
} from "../controllers/taskController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/dashboard-data", protect, asyncHandler(getDashboardData));
router.get("/user-dashboard-data", protect, asyncHandler(getUserDashboardData));
router.get("/", protect, asyncHandler(getTasks));
router.get("/:id", protect, asyncHandler(getTaskById));
router.post("/", protect, asyncHandler(createTask));
router.put("/:id", protect, asyncHandler(updateTask));
router.delete("/:id", protect, adminOnly, asyncHandler(deleteTask));
router.put("/:id/status", protect, asyncHandler(updateTaskStatus));
router.put("/:id/todo", protect, asyncHandler(updateTaskChecklist));

export default router;
