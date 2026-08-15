const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        "Authentication required",
        401
      );
    }

    const [schema, token] = authHeader.split(" ");

    if (schema !== "Bearer" || !token) {
      throw new AppError(
        "Invalid authorization header",
        401
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return next(
      new AppError("Invalid or expired token", 401)
    );
  }

  next(error);
  }
};

module.exports = authMiddleware;