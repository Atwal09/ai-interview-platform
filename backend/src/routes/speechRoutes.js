const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/analyze', aiLimiter, speechController.analyzeTranscript);
router.get('/history', speechController.getSpeechHistory);

module.exports = router;
