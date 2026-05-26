'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: ['interview_complete', 'resume_analyzed', 'achievement', 'system', 'reminder', 'tip'], default: 'system' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false, index: true },
  data:    { type: mongoose.Schema.Types.Mixed, default: {} },
  link:    { type: String, default: null },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
