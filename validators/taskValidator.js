const Joi = require("joi");

const taskStatus = [
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "DONE"
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
}).unknown(false);


// UPDATE TASK
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100),

  description: Joi.string()
    .allow(""),

  status: Joi.string()
    .valid(...taskStatus)
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

  sort: Joi.string()
    .valid("createdAt", "-createdAt")
    .default("-createdAt"),

  fields: Joi.string()
    .trim()
    .pattern(
      /^(title|status|createdAt)(,(title|status|createdAt))*$/
    )
    .default("title,status,createdAt"),

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