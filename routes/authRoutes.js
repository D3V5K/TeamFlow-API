const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

// =======================================================
// ROUTES
// =======================================================

// تسجيل مستخدم جديد
router.post('/register', validate(registerSchema), authController.register);

// تسجيل الدخول
router.post('/login', validate(loginSchema), authController.login);

// تجديد Access Token
router.post('/refresh', authController.refresh);

// تسجيل الخروج (محمي)
router.post('/logout', authMiddleware, authController.logout);

// تسجيل الخروج من جميع الأجهزة (محمي)
router.post('/logout-all', authMiddleware, authController.logoutAll);

// جيب المستخدم الحالي (محمي)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;