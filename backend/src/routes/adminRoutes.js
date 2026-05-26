const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.patch('/users/:id/promote', adminController.promoteUser);
router.get('/interviews', adminController.getInterviews);
router.get('/logs', adminController.getLogs);

module.exports = router;
