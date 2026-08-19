// utils/tokenUtils.js
const JWT = require("jsonwebtoken");
const AppError = require("./AppError");
const refreshTokenRepositorie = require("../repositories/refreshTokenRepositorie");
const UserRepository = require("../repositories/userRepository");

const verifyStoredRefreshToken = async (refreshToken) => {
    const storedToken = await refreshTokenRepositorie.findByToken(refreshToken);
    if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
    }
    return storedToken;
};

const verifyRefreshTokenSignature = (refreshToken) => {
    try {
        return JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401);
    }
};

const generateNewAccessToken = (user) => {
    return JWT.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

const refreshAccessToken = async (refreshToken) => {
    await verifyStoredRefreshToken(refreshToken);
    const decoded = verifyRefreshTokenSignature(refreshToken);
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return generateNewAccessToken(user);
};

module.exports = {
    refreshAccessToken,
    // يمكن تصدير الدوال المساعدة إذا احتجتها فـ مكان آخر
};