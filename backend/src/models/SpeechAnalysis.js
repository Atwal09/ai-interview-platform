'use strict';

const mongoose = require('mongoose');

const speechAnalysisSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', default: null },
  transcript:  { type: String, required: true },
  audioUrl:    { type: String, default: null },
  durationSeconds: { type: Number, default: 0 },

  metrics: {
    fillerWordCount:    { type: Number, default: 0 },
    fillerWordsFound:   [String],
    fillerWordPercentage: { type: Number, default: 0 },
    speakingPace:       { type: String, enum: ['slow', 'moderate', 'fast', 'very_fast', ''], default: '' },
    wordsPerMinute:     { type: Number, default: 0 },
    wordCount:          { type: Number, default: 0 },
    clarityScore:       { type: Number, default: 0 },
    grammarScore:       { type: Number, default: 0 },
    confidenceScore:    { type: Number, default: 0 },
    vocabularyScore:    { type: Number, default: 0 },
    overallSpeechScore: { type: Number, default: 0 },
    repeatedWords:      [String],
    tone:               { type: String, default: '' },
  },

  aiAnalysis: {
    strengths:   [String],
    improvements:[String],
    detailedFeedback: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

speechAnalysisSchema.index({ userId: 1, createdAt: -1 });

const SpeechAnalysis = mongoose.model('SpeechAnalysis', speechAnalysisSchema);
module.exports = SpeechAnalysis;
