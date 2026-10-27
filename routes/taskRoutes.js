const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const taskSchema = require("../validators/taskValidator");
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorize");

// CREATE TASK
router.post(
  "/",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER", "TEAM_LEADER"),
  validate(taskSchema.createTaskSchema),
  taskController.createTask
);

// GET ALL TASKS (with query features)
router.get(
  "/",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER", "TEAM_LEADER", "DEVELOPER"),
  validate(taskSchema.taskQuerySchema, "query"),
  taskController.getTasks
);

// GET TASK STATS (⚠️ يجب أن يكون قبل /:id!)
router.get(
  "/stats",
  authMiddleware,
  taskController.getTaskStats
);

// GET TASK BY ID
router.get(
  "/:id",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER", "TEAM_LEADER", "DEVELOPER"),
  taskController.getTaskById
);

// UPDATE TASK
router.patch(
  "/:id",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER", "TEAM_LEADER", "DEVELOPER"),
  validate(taskSchema.updateTaskSchema),
  taskController.updateTask
);

// DELETE TASK
router.delete(
  "/:id",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER"),
  taskController.deleteTask
);

module.exports = router;