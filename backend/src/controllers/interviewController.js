'use strict';

const Interview = require('../models/Interview');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateInterviewQuestions, analyzeResponse, generateFeedback } = require('../services/aiService');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');

/** POST /api/interviews — Create and generate questions */
async function createInterview(req, res, next) {
  try {
    const { type = 'technical', domain = 'general', difficulty = 'medium', questionCount = 10, title } = req.body;

    // Normalize difficulty in case old values come in
    const difficultyMap = { beginner: 'easy', intermediate: 'medium', advanced: 'hard', expert: 'hard' };
    const normalizedDifficulty = difficultyMap[difficulty] || difficulty || 'medium';

    const questions = await generateInterviewQuestions(type, domain, normalizedDifficulty, questionCount);

    const interview = await Interview.create({
      userId: req.user.id,
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Interview — ${domain}`,
      type, domain, difficulty: normalizedDifficulty,
      questionCount: questions.length,
      questions: questions.map((q, i) => ({
        questionText: q.question,
        type: q.type || type,
        difficulty: difficultyMap[q.difficulty] || q.difficulty || normalizedDifficulty,
        expectedKeywords: q.expectedKeywords || [],
        orderIndex: i,
      })),
      status: 'pending',
    });

    logger.info('Interview created', { interviewId: interview._id, userId: req.user.id });

    res.status(201).json({ success: true, data: { interview } });
  } catch (err) { next(err); }
}

/** GET /api/interviews — List user's interviews */
async function getInterviews(req, res, next) {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .select('-questions -responses -aiFeedback')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Interview.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { interviews, total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

/** GET /api/interviews/:id */
async function getInterview(req, res, next) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');
    res.json({ success: true, data: { interview } });
  } catch (err) { next(err); }
}

/** POST /api/interviews/:id/start */
async function startInterview(req, res, next) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');

    interview.status = 'in_progress';
    interview.startedAt = new Date();
    await interview.save();

    res.json({ success: true, data: { interview } });
  } catch (err) { next(err); }
}

/** POST /api/interviews/:id/respond — Submit answer for a question */
async function submitResponse(req, res, next) {
  try {
    const { questionId, transcript, audioUrl } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');

    const question = interview.questions.id(questionId);
    if (!question) throw new NotFoundError('Question not found');

    // Analyze response with AI
    const analysis = await analyzeResponse(
      question.questionText,
      transcript || '',
      question.type,
      question.expectedKeywords || []
    );

    const responseData = {
      questionId: question._id,
      questionText: question.questionText,
      transcript: transcript || '',
      audioUrl: audioUrl || null,
      score: analysis.score || 0,
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      keywordsMatched: analysis.keywords_matched || [],
      keywordsMissing: analysis.keywords_missing || [],
      overallFeedback: analysis.overall_feedback || '',
      communicationScore: analysis.communication_score || 0,
      technicalAccuracy: analysis.technical_accuracy || 0,
      structureScore: analysis.structure_score || 0,
    };

    // Remove existing response for this question if any, then add new
    interview.responses = interview.responses.filter(r => r.questionId?.toString() !== questionId);
    interview.responses.push(responseData);
    await interview.save();

    res.json({ success: true, data: { analysis, response: responseData } });
  } catch (err) { next(err); }
}

/** POST /api/interviews/:id/complete */
async function completeInterview(req, res, next) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');

    const responses = interview.responses;
    const scores = responses.map(r => r.score || 0);
    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const communicationScore = responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.communicationScore || 0), 0) / responses.length) : 0;
    const technicalScore = responses.length > 0 ? Math.round(responses.reduce((a, r) => a + (r.technicalAccuracy || 0), 0) / responses.length) : 0;

    const startedAt = interview.startedAt || interview.createdAt;
    const durationMs = new Date() - new Date(startedAt);
    const durationMinutes = Math.round(durationMs / 60000);

    // Generate AI feedback
    const feedback = await generateFeedback({
      type: interview.type,
      domain: interview.domain,
      difficulty: interview.difficulty,
      questions: interview.questions,
      responses: responses,
      overall_score: overallScore,
    });

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.durationMinutes = durationMinutes;
    interview.overallScore = overallScore;
    interview.communicationScore = communicationScore;
    interview.technicalScore = technicalScore;
    interview.confidenceScore = Math.round((overallScore + communicationScore) / 2);
    interview.aiFeedback = {
      summary: feedback.summary || '',
      overallRating: feedback.overall_rating || 'average',
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      actionItems: feedback.action_items || [],
      roadmap: feedback.roadmap || [],
      recommendedResources: feedback.recommended_resources || [],
      nextScorePrediction: feedback.next_interview_score_prediction || null,
    };
    await interview.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalInterviews: 1, totalPoints: Math.round(overallScore / 10) },
    });

    // Send notification
    await Notification.create({
      userId: req.user.id,
      type: 'interview_complete',
      title: 'Interview Complete! 🎉',
      message: `You scored ${overallScore}/100 on your ${interview.type} interview.`,
      data: { interviewId: interview._id, score: overallScore },
      link: `/interview/${interview._id}`,
    });

    logger.info('Interview completed', { interviewId: interview._id, score: overallScore });

    res.json({ success: true, data: { interview } });
  } catch (err) { next(err); }
}

/** DELETE /api/interviews/:id */
async function deleteInterview(req, res, next) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) { next(err); }
}

/** GET /api/interviews/:id/analysis */
async function getInterviewAnalysis(req, res, next) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new NotFoundError('Interview not found');
    if (interview.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');

    res.json({
      success: true,
      data: {
        scores: {
          overall: interview.overallScore,
          communication: interview.communicationScore,
          technical: interview.technicalScore,
          confidence: interview.confidenceScore,
        },
        responses: interview.responses,
        aiFeedback: interview.aiFeedback,
        duration: interview.durationMinutes,
      },
    });
  } catch (err) { next(err); }
}

module.exports = { createInterview, getInterviews, getInterview, startInterview, submitResponse, completeInterview, deleteInterview, getInterviewAnalysis };
