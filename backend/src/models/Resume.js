'use strict';

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName:  { type: String, required: true },
  fileUrl:   { type: String, required: true },
  fileSize:  { type: Number, default: 0 },
  mimeType:  { type: String, default: 'application/pdf' },
  targetRole:{ type: String, default: 'Software Engineer' },
  status:    { type: String, enum: ['uploaded', 'processing', 'analyzed', 'failed'], default: 'uploaded', index: true },
  extractedText: { type: String, default: '', select: false },

  // Analysis scores
  scores: {
    atsScore:       { type: Number, min: 0, max: 100, default: null },
    formattingScore:{ type: Number, min: 0, max: 100, default: null },
    keywordScore:   { type: Number, min: 0, max: 100, default: null },
    experienceScore:{ type: Number, min: 0, max: 100, default: null },
    educationScore: { type: Number, min: 0, max: 100, default: null },
  },

  // Detailed analysis
  analysis: {
    sections: {
      hasSummary:      { type: Boolean, default: false },
      hasExperience:   { type: Boolean, default: false },
      hasEducation:    { type: Boolean, default: false },
      hasSkills:       { type: Boolean, default: false },
      hasProjects:     { type: Boolean, default: false },
      hasCertifications:{ type: Boolean, default: false },
      hasContact:      { type: Boolean, default: false },
    },
    keywordsFound:   [String],
    missingKeywords: [String],
    technicalSkills: [String],
    softSkills:      [String],
    suggestions:     [mongoose.Schema.Types.Mixed],
    strengths:       [String],
    weaknesses:      [String],
    overallSummary:  { type: String, default: '' },
  },

  analyzedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
