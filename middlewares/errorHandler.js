const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err?.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  if (err?.isJoi || err?.details) {
    return res.status(400).json({
      status: "fail",
      message: err.details?.[0]?.message || "Validation error"
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      status: "fail",
      message: "Invalid task ID"
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: err.message
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      status: "fail",
      message: "Duplicate value detected"
    });
  }

  const message = process.env.NODE_ENV === "production"
    ? "Something went wrong"
    : err?.message || "Something went wrong";

  return res.status(500).json({
    status: "error",
    message
  });
};

module.exports = errorHandler;