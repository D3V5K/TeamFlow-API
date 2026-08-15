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
}

module.exports = new UserRepository();