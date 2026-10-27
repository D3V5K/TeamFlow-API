const Joi = require("joi");

const taskStatus = [
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "DONE"
];

const taskPriority = [
  "LOW",
  "MEDIUM",
  "HIGH"
];

// CREATE TASK
const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .allow("")
    .default(""),

  status: Joi.string()
    .valid(...taskStatus)
    .default("PENDING"),

  priority: Joi.string()
    .valid(...taskPriority)
    .default("MEDIUM"),

  estimatedHours: Joi.number()
    .min(0)
}).unknown(false);


// UPDATE TASK
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100),

  description: Joi.string()
    .allow(""),

  status: Joi.string()
    .valid(...taskStatus),

  priority: Joi.string()
    .valid(...taskPriority),

  estimatedHours: Joi.number()
    .min(0)
})
  .min(1)
  .unknown(false);


// GET TASKS QUERY
const taskQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  priority: Joi.string()
    .valid(...taskPriority),

  estimatedHours: Joi.number()
    .min(0),

  sort: Joi.string()
    .valid(
      "createdAt",
      "-createdAt",
      "estimatedHours",
      "-estimatedHours"
    )
    .default("-createdAt"),

  fields: Joi.string()
    .trim()
    .pattern(
      /^(title|status|priority|estimatedHours|createdAt)(,(title|status|priority|estimatedHours|createdAt))*$/
    )
    .default(
      "title,status,priority,estimatedHours,createdAt"
    ),

  status: Joi.string()
    .valid(...taskStatus),

  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema
};