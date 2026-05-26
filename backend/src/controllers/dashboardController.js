'use strict';

const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../config/logger');

/** GET /api/dashboard/stats */
async function getStats(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [interviewStats, resumeCount, recentInterviews] = await Promise.all([
      Interview.aggregate([
        { $match: { userId, status: 'completed' } },
        { $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          bestScore: { $max: '$overallScore' },
          totalPracticeHours: { $sum: { $divide: ['$durationMinutes', 60] } },
          avgCommunication: { $avg: '$communicationScore' },
          avgTechnical: { $avg: '$technicalScore' },
        }},
      ]),
      Resume.countDocuments({ userId }),
      Interview.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type domain difficulty status overallScore createdAt completedAt durationMinutes'),
    ]);

    const stats = interviewStats[0] || {};
    const user = await User.findById(req.user.id).select('name streakDays totalPoints totalInterviews');

    res.json({
      success: true,
      data: {
        totalInterviews: stats.totalInterviews || 0,
        avgScore: Math.round(stats.avgScore || 0),
        bestScore: stats.bestScore || 0,
        practiceHours: Math.round((stats.totalPracticeHours || 0) * 10) / 10,
        totalResumes: resumeCount,
        avgCommunication: Math.round(stats.avgCommunication || 0),
        avgTechnical: Math.round(stats.avgTechnical || 0),
        streakDays: user?.streakDays || 0,
        totalPoints: user?.totalPoints || 0,
        recentInterviews,
      },
    });
  } catch (err) { next(err); }
}

/** GET /api/dashboard/performance */
async function getPerformanceChart(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Interview.aggregate([
      { $match: { userId, status: 'completed', completedAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        avgScore: { $avg: '$overallScore' },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', avgScore: { $round: ['$avgScore', 0] }, count: 1, _id: 0 } },
    ]);

    res.json({ success: true, data: { chart: data, days } });
  } catch (err) { next(err); }
}

/** GET /api/dashboard/skills */
async function getSkillsRadar(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Interview.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: {
        _id: null,
        communication: { $avg: '$communicationScore' },
        technical: { $avg: '$technicalScore' },
        confidence: { $avg: '$confidenceScore' },
        overall: { $avg: '$overallScore' },
      }},
    ]);

    const s = stats[0] || {};
    const skills = [
      { skill: 'Communication', score: Math.round(s.communication || 0) },
      { skill: 'Technical', score: Math.round(s.technical || 0) },
      { skill: 'Confidence', score: Math.round(s.confidence || 0) },
      { skill: 'Problem Solving', score: Math.round(s.overall || 0) },
      { skill: 'Leadership', score: Math.round((s.communication || 0) * 0.8) },
      { skill: 'Adaptability', score: Math.round((s.overall || 0) * 0.9) },
    ];

    res.json({ success: true, data: { skills } });
  } catch (err) { next(err); }
}

/** GET /api/dashboard/leaderboard */
async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await User.find({ isActive: true, totalInterviews: { $gt: 0 } })
      .select('name avatar totalPoints totalInterviews avgScore')
      .sort({ totalPoints: -1, avgScore: -1 })
      .limit(10);

    res.json({ success: true, data: { leaderboard } });
  } catch (err) { next(err); }
}

/** GET /api/dashboard/recommendations */
async function getRecommendations(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const weakAreas = await Interview.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: '$type', avgScore: { $avg: '$overallScore' } } },
      { $sort: { avgScore: 1 } },
      { $limit: 3 },
    ]);

    const recommendations = [
      { title: 'Practice Behavioral Questions', type: 'behavioral', difficulty: 'intermediate', reason: 'Builds STAR method skills' },
      { title: 'System Design Deep Dive', type: 'system_design', difficulty: 'advanced', reason: 'High-value skill for senior roles' },
      { title: 'Quick HR Prep Session', type: 'hr', difficulty: 'beginner', reason: 'Boost your confidence score' },
    ];

    res.json({ success: true, data: { recommendations, weakAreas } });
  } catch (err) { next(err); }
}

module.exports = { getStats, getPerformanceChart, getSkillsRadar, getLeaderboard, getRecommendations };
