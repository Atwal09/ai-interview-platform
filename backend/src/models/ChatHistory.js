'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: {
    type: [messageSchema],
    default: [],
    validate: {
      validator: function(v) { return v.length <= 100; },
      message: 'Chat history limited to 100 messages',
    },
  },
}, {
  timestamps: true,
});


// Keep only last 50 messages per user
chatHistorySchema.methods.addMessage = async function(role, content) {
  this.messages.push({ role, content });
  if (this.messages.length > 50) {
    this.messages = this.messages.slice(-50);
  }
  return this.save();
};

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;
