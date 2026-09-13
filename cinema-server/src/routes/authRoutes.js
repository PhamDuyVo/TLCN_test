const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public Auth Routes
router.post('/register-init', authController.registerInit);
router.post('/verify-registration-otp', authController.verifyRegistrationOtp);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Auth Routes (Yêu cầu đăng nhập - JWT Token)
router.get('/me', authMiddleware, authController.getMe);
router.put('/change-password', authMiddleware, authController.changePassword);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
