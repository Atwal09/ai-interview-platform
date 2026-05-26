const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/performance', dashboardController.getPerformanceChart);
router.get('/skills', dashboardController.getSkillsRadar);
router.get('/leaderboard', dashboardController.getLeaderboard);
router.get('/recommendations', dashboardController.getRecommendations);

module.exports = router;
