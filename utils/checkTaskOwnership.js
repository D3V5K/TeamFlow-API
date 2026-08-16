const AppError = require("../utils/AppError"); 
const checkTaskOwnership = (task, user) => {
    if (task.createdBy.toString() !== user.userId.toString()) {
        throw new AppError("Authorization problem", 403);
    }
};

module.exports = checkTaskOwnership
