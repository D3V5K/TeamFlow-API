const asyncHandler = require("../utils/asyncHandler") ;
const authService = require('../services/authService')

const register = asyncHandler(async(req , res) => {
    const user = await authService.register(req.body) ;
    res.status(201).json({
      message: "User created successfully",
        user
    })
}) 

const login = asyncHandler (async (req, res) => {
    const userLogin = await authService.login(req.body) ;
     res.status(200).json({
      message: "Login successful",
        userLogin
    })
})
module.exports = {
    register,
    login ,
};