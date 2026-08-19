const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepositorie {
 
   async create(refreshToken, userId) {
    return await RefreshToken.create({
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    });
}

  
    async findByToken(token) {
        return await RefreshToken.findOne({ token });
    }

 
    async deleteByToken(token) {
        return await RefreshToken.findOneAndDelete({ token });
    }

  
    async deleteAllByUserId(userId) {
        return await RefreshToken.deleteMany({ userId });
    }
}

module.exports = new RefreshTokenRepositorie();
