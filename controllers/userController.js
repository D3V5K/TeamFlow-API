const asyncHandler = require("../utils/asyncHandler") ;
const userService = require('../services/userService') ;

const getMe = asyncHandler (async(req , res) => {
    const user = await userService.getMe(req.user.userId)

    res.status(200).json({
      message: "User found successfully",
        user
    })
})

module.exports = {
    getMe
}