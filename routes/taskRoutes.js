const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const taskSchema = require("../validators/taskValidator");
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorize");

router.post(
  "/tasks",
  authMiddleware,
  authorization("ADMIN", "PROJECT_MANAGER", "TEAM_LEADER"),
  validate(taskSchema.createTaskSchema),
  taskController.createTask
);

router.get(
  "/tasks",
  authMiddleware,
  authorization(
        "ADMIN",
        "PROJECT_MANAGER",
        "TEAM_LEADER",
        "DEVELOPER"
    ),
  validate(taskSchema.taskQuerySchema, "query"),
  taskController.getTasks
);

router.get(
  "/tasks/:id",
  authMiddleware,
   authorization(
        "ADMIN",
        "PROJECT_MANAGER",
        "TEAM_LEADER",
        "DEVELOPER"
    ),
  taskController.getTaskById
);

router.patch(
  "/tasks/:id",
  authMiddleware,
   authorization(
        "ADMIN",
        "PROJECT_MANAGER",
        "TEAM_LEADER",
        "DEVELOPER"
    ),
  validate(taskSchema.updateTaskSchema),
  taskController.updateTask
);

router.delete(
  "/tasks/:id",
  authMiddleware,
      authorization("ADMIN", "PROJECT_MANAGER"),

  taskController.deleteTask
);

module.exports = router;