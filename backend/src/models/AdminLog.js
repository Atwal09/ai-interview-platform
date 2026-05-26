'use strict';

const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:     { type: String, required: true },
  targetType: { type: String, enum: ['user', 'interview', 'resume', 'system'], default: 'user' },
  targetId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  oldValue:   { type: mongoose.Schema.Types.Mixed, default: null },
  newValue:   { type: mongoose.Schema.Types.Mixed, default: null },
  ipAddress:  { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ createdAt: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);
module.exports = AdminLog;
