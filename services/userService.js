const AppError = require("../utils/AppError");
const UserRepository = require("../repositories/userRepository");

const getMe = async(userId) => {
    const user = await UserRepository.getUserById(userId) ;
    if(!user) {
         throw new AppError("User not found", 404);
    }

    const userResponse = user.toObject();
    delete userResponse.password ;

    return userResponse ;
}

module.exports = {
    getMe ,
};