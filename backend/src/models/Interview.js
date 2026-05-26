'use strict';

const mongoose = require('mongoose');

// Embedded question sub-schema
const questionSchema = new mongoose.Schema({
  questionText:     { type: String, required: true },
  type:             { type: String, enum: ['technical', 'behavioral', 'hr', 'system_design', 'mixed'], default: 'technical' },
  difficulty:       { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  expectedKeywords: [String],
  orderIndex:       { type: Number, default: 0 },
}, { _id: true });

// Embedded response sub-schema
const responseSchema = new mongoose.Schema({
  questionId:      { type: mongoose.Schema.Types.ObjectId },
  questionText:    { type: String },
  transcript:      { type: String, default: '' },
  audioUrl:        { type: String, default: null },
  score:           { type: Number, min: 0, max: 100, default: 0 },
  strengths:       [String],
  improvements:    [String],
  keywordsMatched: [String],
  keywordsMissing: [String],
  overallFeedback: { type: String, default: '' },
  communicationScore: { type: Number, default: 0 },
  technicalAccuracy:  { type: Number, default: 0 },
  structureScore:     { type: Number, default: 0 },
  fillerWordCount:    { type: Number, default: 0 },
  wordsPerMinute:     { type: Number, default: 0 },
  answeredAt:      { type: Date, default: Date.now },
}, { _id: true });

const interviewSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, default: 'Mock Interview' },
  type:        { type: String, enum: ['technical', 'behavioral', 'hr', 'system_design', 'mixed'], default: 'technical' },
  domain:      { type: String, default: 'general' },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending', index: true },
  questionCount: { type: Number, default: 10 },

  questions:   [questionSchema],
  responses:   [responseSchema],

  // Scores
  overallScore:       { type: Number, min: 0, max: 100, default: null },
  communicationScore: { type: Number, min: 0, max: 100, default: null },
  confidenceScore:    { type: Number, min: 0, max: 100, default: null },
  technicalScore:     { type: Number, min: 0, max: 100, default: null },

  // AI Feedback
  aiFeedback: {
    summary:        { type: String, default: '' },
    overallRating:  { type: String, enum: ['excellent', 'good', 'average', 'needs_improvement', ''], default: '' },
    strengths:      [mongoose.Schema.Types.Mixed],
    weaknesses:     [mongoose.Schema.Types.Mixed],
    actionItems:    [mongoose.Schema.Types.Mixed],
    roadmap:        [mongoose.Schema.Types.Mixed],
    recommendedResources: [mongoose.Schema.Types.Mixed],
    nextScorePrediction: { type: Number, default: null },
  },

  startedAt:   { type: Date, default: null },
  completedAt: { type: Date, default: null },
  durationMinutes: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ type: 1 });

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
