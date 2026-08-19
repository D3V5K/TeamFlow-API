const User = require("../models/User");

class UserRepository {

    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async getUserById(userId) {
        return await User.findById(userId);
    }
    async incrementFailedAttempts(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { failedAttempts: 1 } },
            { new: true }
        );
    }

    async updateLastLogin(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { 
                lastLogin: new Date(),
                failedAttempts: 0 
            },
            { new: true }
        );
    }

     async updateLastLogout(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { lastLogout: new Date() },
            { new: true }
        );
    }

     async findById(userId) {
        return await User.findById(userId).select('-password');
    }

}

module.exports = new UserRepository();