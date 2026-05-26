'use strict';

const ChatHistory = require('../models/ChatHistory');
const { generateChatResponse } = require('../services/aiService');
const logger = require('../config/logger');

/** POST /api/chat */
async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    // Load or create chat history for this user
    let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user.id, messages: [] });
    }

    const history = chatHistory.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    const response = await generateChatResponse(message, {
      userName: req.user.name,
      history,
    });

    // Save both messages
    await chatHistory.addMessage('user', message);
    await chatHistory.addMessage('assistant', response);

    logger.info('Chat message processed', { userId: req.user.id });

    res.json({ success: true, data: { response, history: chatHistory.messages.slice(-20) } });
  } catch (err) { next(err); }
}

/** GET /api/chat/history */
async function getChatHistory(req, res, next) {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    res.json({ success: true, data: { history: chatHistory?.messages || [] } });
  } catch (err) { next(err); }
}

/** DELETE /api/chat/history */
async function clearChatHistory(req, res, next) {
  try {
    await ChatHistory.findOneAndUpdate({ userId: req.user.id }, { messages: [] });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) { next(err); }
}

module.exports = { chat, getChatHistory, clearChatHistory };
