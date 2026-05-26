'use strict';

const User = require('../models/User');
const Interview = require('../models/Interview');
const AdminLog = require('../models/AdminLog');
const mongoose = require('mongoose');
const { NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

/** GET /api/admin/stats */
async function getStats(req, res, next) {
  try {
    const [totalUsers, activeUsers, totalInterviews, completedInterviews, newUsersToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
    ]);

    res.json({
      success: true,
      data: { totalUsers, activeUsers, totalInterviews, completedInterviews, newUsersToday },
    });
  } catch (err) { next(err); }
}

/** GET /api/admin/users */
async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'banned') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

/** PATCH /api/admin/users/:id/ban */
async function banUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw new NotFoundError('User not found');

    await AdminLog.create({
      adminId: req.user.id,
      action: 'ban_user',
      targetType: 'user',
      targetId: user._id,
      ipAddress: req.ip,
    });

    logger.info('User banned by admin', { userId: user._id, adminId: req.user.id });
    res.json({ success: true, message: 'User banned', data: { user } });
  } catch (err) { next(err); }
}

/** PATCH /api/admin/users/:id/unban */
async function unbanUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) throw new NotFoundError('User not found');

    await AdminLog.create({
      adminId: req.user.id,
      action: 'unban_user',
      targetType: 'user',
      targetId: user._id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'User unbanned', data: { user } });
  } catch (err) { next(err); }
}

/** PATCH /api/admin/users/:id/promote */
async function promoteUser(req, res, next) {
  try {
    const { role = 'admin' } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw new NotFoundError('User not found');

    await AdminLog.create({
      adminId: req.user.id,
      action: 'promote_user',
      targetType: 'user',
      targetId: user._id,
      newValue: { role },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `User promoted to ${role}`, data: { user } });
  } catch (err) { next(err); }
}

/** GET /api/admin/interviews */
async function getInterviews(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('userId', 'name email')
        .select('-questions -responses -aiFeedback')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Interview.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { interviews, total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

/** GET /api/admin/logs */
async function getLogs(req, res, next) {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: { logs } });
  } catch (err) { next(err); }
}

module.exports = { getStats, getUsers, banUser, unbanUser, promoteUser, getInterviews, getLogs };
