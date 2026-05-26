const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const interviewRoutes = require('./interviewRoutes');
const resumeRoutes = require('./resumeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const chatRoutes = require('./chatRoutes');
const speechRoutes = require('./speechRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/interviews', interviewRoutes);
router.use('/resume', resumeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/speech', speechRoutes);

module.exports = router;
