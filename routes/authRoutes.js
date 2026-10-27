const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');



router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.post('/refresh', authController.refresh);

router.post('/logout', authMiddleware, authController.logout);

router.post('/logout-all', authMiddleware, authController.logoutAll);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;