'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const { generateAccessToken, generateRefreshToken, generateSecureToken, hashToken } = require('../utils/helpers');
const { UnauthorizedError, NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');
const { TOKEN_EXPIRY } = require('../utils/constants');

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
}

/** POST /api/auth/register */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateSecureToken(32);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
      role: role === 'recruiter' ? 'recruiter' : 'user',
    });

    sendVerificationEmail(user, verificationToken).catch((err) =>
      logger.error('Verification email failed', { error: err.message })
    );

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User registered', { userId: user._id, email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: { user: sanitizeUser(user), token, refreshToken },
    });
  } catch (err) { next(err); }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.password) throw new UnauthorizedError('Please login with Google — this account uses Google OAuth');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Your account has been deactivated');

    await User.updateLastLogin(user._id);

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User logged in', { userId: user._id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: sanitizeUser(user), token, refreshToken },
    });
  } catch (err) { next(err); }
}

/** Google OAuth callback */
async function googleCallback(req, res, next) {
  try {
    const user = req.user;
    if (!user) throw new UnauthorizedError('Google authentication failed');

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (err) { next(err); }
}

/** POST /api/auth/refresh */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new UnauthorizedError('Refresh token is required');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new UnauthorizedError('User not found or deactivated');

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    res.json({
      success: true,
      data: {
        token: generateAccessToken(tokenPayload),
        refreshToken: generateRefreshToken(tokenPayload),
      },
    });
  } catch (err) { next(err); }
}

/** GET /api/auth/verify-email/:token */
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    const user = await User.findByVerificationToken(token);
    if (!user) throw new UnauthorizedError('Invalid or expired verification token');

    await User.verifyEmail(user._id);
    sendWelcomeEmail(user).catch(() => {});

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (err) { next(err); }
}

/** POST /api/auth/forgot-password */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (user) {
      const rawToken = generateSecureToken(32);
      const hashedToken = hashToken(rawToken);
      const expiry = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);
      await User.setResetToken(user._id, hashedToken, expiry);
      sendPasswordResetEmail(user, rawToken).catch(() => {});
    }

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

/** POST /api/auth/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = hashToken(token);
    const user = await User.findByResetToken(hashedToken);
    if (!user) throw new UnauthorizedError('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.updatePassword(user._id, hashedPassword);

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) { next(err); }
}

/** POST /api/auth/logout */
async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully' });
}

/** GET /api/auth/me */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    const stats = await User.getStats(req.user.id).catch(() => null);
    res.json({ success: true, data: { user: sanitizeUser(user), stats } });
  } catch (err) { next(err); }
}

/** PUT /api/auth/me */
async function updateProfile(req, res, next) {
  try {
    const updatedUser = await User.update(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: { user: sanitizeUser(updatedUser) } });
  } catch (err) { next(err); }
}

/** POST /api/auth/change-password */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    const user = await User.findByEmailWithPassword(req.user.email);
    if (!user || !user.password) throw new UnauthorizedError('Cannot change password for OAuth accounts');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(req.user.id, hashed);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

module.exports = { register, login, googleCallback, refreshToken, verifyEmail, forgotPassword, resetPassword, logout, getMe, updateProfile, changePassword };
