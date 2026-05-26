const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');
const validate = require('../middleware/validate');
const passport = require('passport');

// Public routes
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  authController.googleCallback
);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
