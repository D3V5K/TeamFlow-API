const taskService = require("../services/taskService")
const asyncHandler = require("../utils/asyncHandler") ;

const createTask = asyncHandler(async (req, res) => {

    const task = await taskService.createTask(
        req.body,
        req.user
    );

    res.status(201).json({
        message: "Task created successfully",
        task
    });
});

const getTasks = asyncHandler(async (req, res) => {

    const result = await taskService.getTasks(
        req.user,
        req.query
    );

    res.status(200).json({
        message: "Tasks fetched successfully",
        ...result
    });
});

const getTaskById = asyncHandler (async(req , res) => {
    const task = await taskService.getTaskById(
        req.params.id,
        req.user.userId
    )

     res.status(200).json({
        message: "Task find successfully",
        task
    });
})

const updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(
        req.params.id,
        req.user.userId,
        req.body
    );

    res.status(200).json({
        message: "Task updated successfully",
        task
    });
});


const deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(
        req.params.id,
        req.user.userId
    );

    res.status(200).json({
        message: "Task deleted successfully"
    });
});

module.exports = {
    createTask ,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
}