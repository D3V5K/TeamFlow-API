const express = require('express')
const router = express.Router() ;

const authValidator = require('../validators/authValidator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');


router.post(
    "/register",
    validate(authValidator.registerSchema),
    authController.register
)

router.post(
    "/login",
    validate(authValidator.loginSchema),
    authController.login
)

module.exports = router;