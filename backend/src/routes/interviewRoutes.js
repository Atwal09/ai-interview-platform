const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/', aiLimiter, interviewController.createInterview);
router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterview);
router.post('/:id/respond', aiLimiter, interviewController.submitResponse);
router.post('/:id/complete', interviewController.completeInterview);
router.get('/:id/analysis', interviewController.getInterviewAnalysis);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
