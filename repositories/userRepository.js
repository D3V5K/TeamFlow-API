const User = require("../models/User");

class UserRepository {
  async createUser(userData) {
    return User.create(userData);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }
}

module.exports = new UserRepository();