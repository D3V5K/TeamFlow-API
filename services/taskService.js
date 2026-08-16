const mongoose = require("mongoose");
const taskRepositorie = require("../repositories/taskRepositorie");
const AppError = require("../utils/AppError");
const checkTaskOwnership = require("../utils/checkTaskOwnership");

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const sanitizeTaskData = (taskData = {}) => {
    const allowedData = {};

    if (taskData.title !== undefined) allowedData.title = taskData.title;
    if (taskData.description !== undefined) allowedData.description = taskData.description;
    if (taskData.status !== undefined) allowedData.status = taskData.status;

    return allowedData;
};

const createTask = async (taskData, user) => {
    const allowedData = sanitizeTaskData(taskData);

    const task = await taskRepositorie.create({
        ...allowedData,
        createdBy: user.userId
    });

    return task;
};

const getTasks = async (user, queryString) => {
    const { tasks, total } = await taskRepositorie.findAll(user.userId, queryString);

    const page = Number(queryString.page) || 1;
    const limit = Number(queryString.limit) || 10;

    const totalPages = Math.ceil(total / limit);

    return {
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

const getTaskById = async (id, userId) => {
    if (!isValidObjectId(id)) {
        throw new AppError("Invalid task ID", 400);
    }

    const task = await taskRepositorie.findById(id, userId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    checkTaskOwnership(task, { userId });

    return task;
};

const updateTask = async (id, userId, data) => {
    if (!isValidObjectId(id)) {
        throw new AppError("Invalid task ID", 400);
    }

    const allowedData = sanitizeTaskData(data);

    if (Object.keys(allowedData).length === 0) {
        throw new AppError("At least one field is required", 400);
    }

    const task = await taskRepositorie.update(id, userId, allowedData);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
};

const deleteTask = async (id, userId) => {
    if (!isValidObjectId(id)) {
        throw new AppError("Invalid task ID", 400);
    }

    const task = await taskRepositorie.delete(id, userId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};