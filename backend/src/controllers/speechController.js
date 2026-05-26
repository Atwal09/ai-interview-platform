'use strict';

const SpeechAnalysis = require('../models/SpeechAnalysis');
const { analyzeSpeech } = require('../services/aiService');
const logger = require('../config/logger');

/** POST /api/speech/analyze */
async function analyzeTranscript(req, res, next) {
  try {
    const { transcript, interviewId, audioUrl, durationSeconds } = req.body;
    if (!transcript?.trim()) {
      return res.status(400).json({ success: false, message: 'Transcript is required' });
    }

    const aiAnalysis = await analyzeSpeech(transcript, {
      speaking_rate: req.body.speakingRate,
      pause_count: req.body.pauseCount,
    });

    const record = await SpeechAnalysis.create({
      userId: req.user.id,
      interviewId: interviewId || null,
      transcript,
      audioUrl: audioUrl || null,
      durationSeconds: durationSeconds || 0,
      metrics: {
        fillerWordCount:     aiAnalysis.filler_word_count || 0,
        fillerWordsFound:    aiAnalysis.filler_words_found || [],
        fillerWordPercentage: aiAnalysis.filler_word_percentage || 0,
        speakingPace:        aiAnalysis.speaking_pace || 'moderate',
        wordsPerMinute:      aiAnalysis.words_per_minute || 0,
        wordCount:           aiAnalysis.word_count || 0,
        clarityScore:        aiAnalysis.clarity_score || 0,
        grammarScore:        aiAnalysis.grammar_score || 0,
        confidenceScore:     aiAnalysis.confidence_score || 0,
        vocabularyScore:     aiAnalysis.vocabulary_score || 0,
        overallSpeechScore:  aiAnalysis.overall_speech_score || 0,
        repeatedWords:       aiAnalysis.repeated_words || [],
        tone:                aiAnalysis.tone || '',
      },
      aiAnalysis: {
        strengths:        aiAnalysis.strengths || [],
        improvements:     aiAnalysis.improvements || [],
        detailedFeedback: aiAnalysis.detailed_feedback || '',
      },
    });

    logger.info('Speech analyzed', { userId: req.user.id, score: aiAnalysis.overall_speech_score });

    res.json({ success: true, data: { analysis: aiAnalysis, record } });
  } catch (err) { next(err); }
}

/** GET /api/speech/history */
async function getSpeechHistory(req, res, next) {
  try {
    const history = await SpeechAnalysis.find({ userId: req.user.id })
      .select('-transcript')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: { history } });
  } catch (err) { next(err); }
}

module.exports = { analyzeTranscript, getSpeechHistory };
