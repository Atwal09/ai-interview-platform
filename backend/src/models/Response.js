'use strict';

const { query } = require('../config/database');
const logger = require('../config/logger');
const { DatabaseError } = require('../utils/errors');

/**
 * Response model — all operations via raw SQL (pg)
 */
const Response = {
  /**
   * Create a new response
   */
  async create(data) {
    const {
      interview_id,
      question_id,
      user_id,
      response_text,
      audio_url = null,
      duration_seconds = null,
    } = data;

    try {
      const result = await query(
        `INSERT INTO responses (interview_id, question_id, user_id, response_text,
                                audio_url, duration_seconds, answered_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [interview_id, question_id, user_id, response_text, audio_url, duration_seconds]
      );
      return result.rows[0];
    } catch (err) {
      logger.error('Response.create error', { error: err.message });
      throw new DatabaseError('Failed to create response', err);
    }
  },

  /**
   * Find all responses for an interview
   */
  async findByInterviewId(interviewId) {
    try {
      const result = await query(
        `SELECT r.*, q.question_text, q.question_type, q.expected_keywords
         FROM responses r
         JOIN questions q ON q.id = r.question_id
         WHERE r.interview_id = $1
         ORDER BY r.answered_at ASC`,
        [interviewId]
      );
      return result.rows;
    } catch (err) {
      logger.error('Response.findByInterviewId error', { error: err.message });
      throw new DatabaseError('Failed to find responses', err);
    }
  },

  /**
   * Find a single response by ID
   */
  async findById(id) {
    try {
      const result = await query(
        `SELECT r.*, q.question_text, q.question_type, q.expected_keywords
         FROM responses r
         JOIN questions q ON q.id = r.question_id
         WHERE r.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      logger.error('Response.findById error', { error: err.message, id });
      throw new DatabaseError('Failed to find response', err);
    }
  },

  /**
   * Update response with AI analysis results
   */
  async update(id, data) {
    const { score, feedback, keywords_matched, strengths, improvements, speech_analysis } = data;

    try {
      const result = await query(
        `UPDATE responses SET
           score = COALESCE($1, score),
           feedback = COALESCE($2, feedback),
           keywords_matched = COALESCE($3, keywords_matched),
           strengths = COALESCE($4, strengths),
           improvements = COALESCE($5, improvements),
           speech_analysis = COALESCE($6, speech_analysis),
           updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [
          score,
          feedback,
          keywords_matched ? JSON.stringify(keywords_matched) : null,
          strengths ? JSON.stringify(strengths) : null,
          improvements ? JSON.stringify(improvements) : null,
          speech_analysis ? JSON.stringify(speech_analysis) : null,
          id,
        ]
      );
      return result.rows[0] || null;
    } catch (err) {
      logger.error('Response.update error', { error: err.message, id });
      throw new DatabaseError('Failed to update response', err);
    }
  },

  /**
   * Get average score for an interview
   */
  async getAverageScore(interviewId) {
    try {
      const result = await query(
        `SELECT ROUND(AVG(score), 2) as avg_score, COUNT(*) as total
         FROM responses WHERE interview_id = $1 AND score IS NOT NULL`,
        [interviewId]
      );
      return result.rows[0];
    } catch (err) {
      logger.error('Response.getAverageScore error', { error: err.message });
      throw new DatabaseError('Failed to get average score', err);
    }
  },

  /**
   * Find response by question and interview
   */
  async findByQuestionId(interviewId, questionId) {
    try {
      const result = await query(
        `SELECT * FROM responses WHERE interview_id = $1 AND question_id = $2`,
        [interviewId, questionId]
      );
      return result.rows[0] || null;
    } catch (err) {
      logger.error('Response.findByQuestionId error', { error: err.message });
      throw new DatabaseError('Failed to find response by question', err);
    }
  },
};

module.exports = Response;
