const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.post('/', aiLimiter, chatController.chat);
router.get('/history', chatController.getChatHistory);
router.delete('/history', chatController.clearChatHistory);

module.exports = router;
