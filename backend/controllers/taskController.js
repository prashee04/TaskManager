import Task from "../models/Task.js";
import mongoose from "mongoose";

const validStatuses = ["Pending", "In Progress", "Completed"];
const validPriorities = ["Low", "Medium", "High"];

const isAdminUser = (user) => user.role?.toLowerCase() === "admin";

const isAssignedToUser = (task, userId) =>
  task.assignedTo.some(
    (assignedUserId) => assignedUserId.toString() === userId.toString(),
  );

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeChecklist = (todoChecklist = []) =>
  todoChecklist
    .filter((item) => item?.text?.trim())
    .map((item) => ({
      text: item.text.trim(),
      completed: Boolean(item.completed),
    }));

const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid task status." });
    }

    const isAdmin = isAdminUser(req.user);
    let tasks;

    if (isAdmin) {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl",
      );
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
        "assignedTo",
        "name email profileImageUrl",
      );
    }

    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed,
        ).length;

        return {
          ...task._doc,
          completedTodoCount: completedCount,
        };
      }),
    );

    const allTasks = await Task.countDocuments(
      isAdmin ? {} : { assignedTo: req.user._id },
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...(!isAdmin && { assignedTo: req.user._id }),
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...(!isAdmin && { assignedTo: req.user._id }),
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(!isAdmin && { assignedTo: req.user._id }),
    });
    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (!isAdminUser(req.user) && !isAssignedToUser(task, req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this task." });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    const isAdmin = isAdminUser(req.user);
    let assignedToList = [];

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can create tasks.",
      });
    }

    if (!title?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Title and due date are required.",
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid task priority." });
    }

    if (assignedTo) {
      if (!Array.isArray(assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs." });
      }

      if (!isAdmin && assignedTo.length > 0) {
        return res.status(403).json({
          message: "Only admins can assign tasks to members.",
        });
      }

      const invalidUserIds = assignedTo.filter(
        (userId) => !isValidObjectId(userId),
      );
      if (invalidUserIds.length > 0) {
        return res
          .status(400)
          .json({ message: "assignedTo contains invalid user IDs." });
      }

      assignedToList = assignedTo;
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      dueDate,
      assignedTo: assignedToList,
      attachments,
      todoChecklist: normalizeChecklist(todoChecklist),
      createdBy: req.user._id,
    });
    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAdmin = isAdminUser(req.user);
    const isAssignedUser = isAssignedToUser(task, req.user._id);

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        message: "You are not authorized to update this task.",
      });
    }

    if (req.body.priority && !validPriorities.includes(req.body.priority)) {
      return res.status(400).json({ message: "Invalid task priority." });
    }

    task.title = req.body.title?.trim() || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist
      ? normalizeChecklist(req.body.todoChecklist)
      : task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs." });
      }

      if (!isAdmin) {
        return res.status(403).json({
          message: "Only admins can change task assignments.",
        });
      }

      const invalidUserIds = req.body.assignedTo.filter(
        (userId) => !isValidObjectId(userId),
      );
      if (invalidUserIds.length > 0) {
        return res
          .status(400)
          .json({ message: "assignedTo contains invalid user IDs." });
      }

      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully.", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found." });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAssignedUser = isAssignedToUser(task, req.user._id);
    const isAdmin = isAdminUser(req.user);

    if (!isAssignedUser && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to update the status of this task.",
      });
    }

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid task status." });
    }

    task.status = req.body.status;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    } else if (task.todoChecklist.length > 0) {
      const completedCount = task.todoChecklist.filter(
        (item) => item.completed,
      ).length;
      task.progress = Math.round(
        (completedCount / task.todoChecklist.length) * 100,
      );
    }

    await task.save();
    res.json({ message: "Task status updated successfully.", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    if (!Array.isArray(todoChecklist)) {
      return res
        .status(400)
        .json({ message: "todoChecklist must be an array." });
    }

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAdmin = isAdminUser(req.user);
    const isAssignedUser = isAssignedToUser(task, req.user._id);

    if (!isAssignedUser && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to update the checklist of this task.",
      });
    }
    task.todoChecklist = normalizeChecklist(todoChecklist);

    const completedCount = task.todoChecklist.filter(
      (item) => item.completed,
    ).length;

    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );

    res.json({
      message: "Task checklist updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s/g, "").toLowerCase();
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("assignedTo", "name email profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("assignedTo", "name email profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
