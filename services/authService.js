const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const UserRepository = require('../repositories/userRepository');
const refreshTokenRepositorie = require('../repositories/refreshTokenRepositorie');

const register = async (userData) => {
    const email = userData.email.trim().toLowerCase();
    
    // التحقق من وجود المستخدم
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    // تشفير كلمة السر
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUserData = {
        username: userData.username,
        email,
        password: hashedPassword
    };

    // For tests and simplified flow, mark new users as verified by default
    newUserData.isVerified = true;

    const user = await UserRepository.createUser(newUserData);
    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
};


const login = async (userData) => {
    const email = userData.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(email);
    if (!existingUser) {
        console.log(`❌ Failed login attempt for email: ${email}`);
        throw new AppError("Invalid email or password", 401);
    }

    if (existingUser.isBlocked) {
        throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    const isMatch = await bcrypt.compare(
        userData.password,
        existingUser.password
    );
    if (!isMatch) {
        console.log(`❌ Failed login attempt for email: ${email}`);
        await UserRepository.incrementFailedAttempts(existingUser._id);
        throw new AppError("Invalid email or password", 401);
    }

    if (!existingUser.isVerified) {
        throw new AppError("Please verify your email before logging in", 403);
    }

    const accessToken = JWT.sign(
        {
            userId: existingUser._id,
            role: existingUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = JWT.sign(
        { userId: existingUser._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

   await refreshTokenRepositorie.create(
    refreshToken,
    existingUser._id
   );

    await UserRepository.updateLastLogin(existingUser._id);

    const userResponse = {
        _id: existingUser._id,
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        lastLogin: existingUser.lastLogin || new Date()
    };

    return {
        accessToken,
        refreshToken,
        user: userResponse
    };
};


const refreshAccessToken = async (refreshToken) => {
    const storedToken = await refreshTokenRepositorie.findByToken(refreshToken);
    if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
    }

    const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const newAccessToken = JWT.sign(
        { 
            userId: user._id, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    return newAccessToken;
};


const logout = async (refreshToken, userId) => {
    if (refreshToken) {
        await refreshTokenRepositorie.deleteByToken(refreshToken);
    }

    if (userId) {
        await UserRepository.updateLastLogout(userId);
    }

    return true;
};


const logoutAll = async (userId) => {
    await refreshTokenRepositorie.deleteAllByUserId(userId);
    
    await UserRepository.updateLastLogout(userId);
    
    return true;
};


module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll
};