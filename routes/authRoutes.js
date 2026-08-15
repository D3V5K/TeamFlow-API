const express = require("express");
const router = express.Router();

const authValidator = require("../validators/authValidator");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/register",
  validate(authValidator.registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(authValidator.loginSchema),
  authController.login
);

router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "Authenticated successfully",
      user: req.user
    });
  }
);

module.exports = router;