const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const UserRepository = require('../repositories/userRepository');

const register = async (userData) => {
    const email = userData.email.trim().toLowerCase() ;
    const existingUser = await UserRepository.findByEmail(email) ;

    if (existingUser) {
        throw new AppError("email already exists" , 409)
    }

const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUserData = {
        username: userData.username,
        email ,
        password : hashedPassword
    }

    const user = await UserRepository.createUser(newUserData) ;
    const userResponse = user.toObject() ;

    delete userResponse.password ;


    return userResponse ;
}


const login = async (userData) => {
  const email = userData.email.trim().toLowerCase();

  const existingUser = await UserRepository.findByEmail(email);

  if (!existingUser) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(
    userData.password,
    existingUser.password
  );

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = JWT.sign(
    {
      userId: existingUser._id,
      role: existingUser.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1D"
    }
  );

  const userResponse = {
    username: existingUser.username,
    email: existingUser.email,
    role: existingUser.role
  };

  return {
    token,
    user: userResponse
  };
};

module.exports = {
    register,
    login
};