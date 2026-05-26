'use strict';

const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { analyzeResume } = require('../services/aiService');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');

// Extract text from PDF using pdf-parse
async function extractPdfText(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    logger.warn('PDF text extraction failed', { error: err.message });
    return '';
  }
}

/** POST /api/resumes/upload */
async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { targetRole = 'Software Engineer' } = req.body;
    const fileUrl = req.file.location || `/uploads/resumes/${req.file.filename}`;
    const filePath = req.file.path || path.join(__dirname, '../../uploads/resumes', req.file.filename);

    // Create resume record
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      targetRole,
      status: 'processing',
    });

    // Async analysis — don't await so response is fast
    (async () => {
      try {
        const extractedText = await extractPdfText(filePath);
        const analysis = await analyzeResume(extractedText, targetRole);

        await Resume.findByIdAndUpdate(resume._id, {
          extractedText,
          status: 'analyzed',
          analyzedAt: new Date(),
          'scores.atsScore': analysis.ats_score || 0,
          'scores.formattingScore': analysis.formatting_score || 0,
          'scores.keywordScore': analysis.keyword_score || 0,
          'scores.experienceScore': analysis.experience_score || 0,
          'scores.educationScore': analysis.education_score || 0,
          'analysis.sections': {
            hasSummary: analysis.sections?.has_summary || false,
            hasExperience: analysis.sections?.has_experience || false,
            hasEducation: analysis.sections?.has_education || false,
            hasSkills: analysis.sections?.has_skills || false,
            hasProjects: analysis.sections?.has_projects || false,
            hasCertifications: analysis.sections?.has_certifications || false,
            hasContact: analysis.sections?.has_contact || false,
          },
          'analysis.keywordsFound': analysis.keywords_found || [],
          'analysis.missingKeywords': analysis.missing_keywords || [],
          'analysis.technicalSkills': analysis.technical_skills || [],
          'analysis.softSkills': analysis.soft_skills || [],
          'analysis.suggestions': analysis.suggestions || [],
          'analysis.strengths': analysis.strengths || [],
          'analysis.weaknesses': analysis.weaknesses || [],
          'analysis.overallSummary': analysis.overall_summary || '',
        });

        await Notification.create({
          userId: req.user.id,
          type: 'resume_analyzed',
          title: 'Resume Analyzed! 📄',
          message: `Your resume scored ${analysis.ats_score || 0}/100 for ATS compatibility.`,
          data: { resumeId: resume._id, atsScore: analysis.ats_score },
          link: '/resume',
        });

        logger.info('Resume analyzed', { resumeId: resume._id, atsScore: analysis.ats_score });
      } catch (err) {
        await Resume.findByIdAndUpdate(resume._id, { status: 'failed' });
        logger.error('Resume analysis failed', { error: err.message, resumeId: resume._id });
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analysis started',
      data: { resume },
    });
  } catch (err) { next(err); }
}

/** GET /api/resumes */
async function getResumes(req, res, next) {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { resumes } });
  } catch (err) { next(err); }
}

/** GET /api/resumes/:id */
async function getResume(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw new NotFoundError('Resume not found');
    if (resume.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');
    res.json({ success: true, data: { resume } });
  } catch (err) { next(err); }
}

/** DELETE /api/resumes/:id */
async function deleteResume(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw new NotFoundError('Resume not found');
    if (resume.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) { next(err); }
}

/** GET /api/resumes/:id/analysis */
async function getResumeAnalysis(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id).select('+extractedText');
    if (!resume) throw new NotFoundError('Resume not found');
    if (resume.userId.toString() !== req.user.id) throw new ForbiddenError('Access denied');
    res.json({ success: true, data: { analysis: resume.analysis, scores: resume.scores, status: resume.status } });
  } catch (err) { next(err); }
}

module.exports = { uploadResume, getResumes, getResume, deleteResume, getResumeAnalysis };
