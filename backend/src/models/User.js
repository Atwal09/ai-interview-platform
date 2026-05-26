'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:           { type: String, select: false },
  role:               { type: String, enum: ['user', 'admin', 'recruiter'], default: 'user' },
  googleId:           { type: String, sparse: true },
  avatar:             { type: String, default: null },
  bio:                { type: String, default: '' },
  phone:              { type: String, default: '' },
  location:           { type: String, default: '' },
  linkedinUrl:        { type: String, default: '' },
  githubUrl:          { type: String, default: '' },
  targetRole:         { type: String, default: 'Software Engineer' },
  experienceLevel:    { type: String, enum: ['entry', 'mid', 'senior', 'lead'], default: 'mid' },
  isVerified:         { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
  verificationToken:  { type: String, default: null, select: false },
  resetPasswordToken: { type: String, default: null, select: false },
  resetPasswordExpires:{ type: Date, default: null, select: false },
  totalPoints:        { type: Number, default: 0 },
  streakDays:         { type: Number, default: 0 },
  lastStreakDate:     { type: Date, default: null },
  totalInterviews:    { type: Number, default: 0 },
  avgScore:           { type: Number, default: 0 },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications:  { type: Boolean, default: true },
  lastLoginAt:        { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

// ─── Static Methods (matching existing controller interface) ──────────────────
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({ verificationToken: token }).select('+verificationToken');
};

userSchema.statics.findByResetToken = function(hashedToken) {
  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');
};

userSchema.statics.updateLastLogin = function(userId) {
  return this.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
};

userSchema.statics.verifyEmail = function(userId) {
  return this.findByIdAndUpdate(userId, {
    isVerified: true,
    verificationToken: null,
  });
};

userSchema.statics.setResetToken = function(userId, hashedToken, expiry) {
  return this.findByIdAndUpdate(userId, {
    resetPasswordToken: hashedToken,
    resetPasswordExpires: expiry,
  });
};

userSchema.statics.updatePassword = async function(userId, hashedPassword) {
  return this.findByIdAndUpdate(userId, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};

userSchema.statics.update = function(userId, data) {
  const allowed = ['name', 'bio', 'phone', 'location', 'linkedinUrl', 'githubUrl',
                   'targetRole', 'experienceLevel', 'emailNotifications', 'pushNotifications', 'avatar'];
  const update = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  return this.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
};

userSchema.statics.getStats = async function(userId) {
  const Interview = require('./Interview');
  const Resume = require('./Resume');

  const [interviewStats, resumeStats] = await Promise.all([
    Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        avgScore: { $avg: '$overallScore' },
        totalPracticeMinutes: { $sum: '$durationMinutes' },
        bestScore: { $max: '$overallScore' },
      }},
    ]),
    Resume.countDocuments({ userId }),
  ]);

  const stats = interviewStats[0] || {};
  return {
    totalInterviews: stats.totalInterviews || 0,
    avgScore: Math.round(stats.avgScore || 0),
    totalPracticeMinutes: stats.totalPracticeMinutes || 0,
    bestScore: stats.bestScore || 0,
    totalResumes: resumeStats || 0,
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;
