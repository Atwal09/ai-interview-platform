'use strict';

const { query } = require('../config/database');
const logger = require('../config/logger');
const { DatabaseError } = require('../utils/errors');

/**
 * Question model — all operations via raw SQL (pg)
 */
const Question = {
  /**
   * Create a single question
   */
  async create(data) {
    const {
      interview_id,
      question_text,
      question_type,
      expected_keywords = [],
      difficulty,
      order_index,
      time_limit_seconds = 120,
    } = data;

    try {
      const result = await query(
        `INSERT INTO questions (interview_id, question_text, question_type, expected_keywords,
                                difficulty, order_index, time_limit_seconds, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          interview_id,
          question_text,
          question_type,
          JSON.stringify(expected_keywords),
          difficulty,
          order_index,
          time_limit_seconds,
        ]
      );
      return result.rows[0];
    } catch (err) {
      logger.error('Question.create error', { error: err.message });
      throw new DatabaseError('Failed to create question', err);
    }
  },

  /**
   * Bulk insert questions for an interview
   */
  async bulkCreate(interviewId, questions) {
    if (!questions || questions.length === 0) return [];

    try {
      const values = [];
      const placeholders = questions.map((q, i) => {
        const base = i * 7;
        values.push(
          interviewId,
          q.question_text || q.question,
          q.question_type || q.type || 'technical',
          JSON.stringify(q.expected_keywords || q.expectedKeywords || []),
          q.difficulty || 'intermediate',
          q.order_index !== undefined ? q.order_index : i,
          q.time_limit_seconds || 120
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, NOW())`;
      });

      const result = await query(
        `INSERT INTO questions (interview_id, question_text, question_type, expected_keywords,
                                difficulty, order_index, time_limit_seconds, created_at)
         VALUES ${placeholders.join(', ')}
         RETURNING *`,
        values
      );
      return result.rows;
    } catch (err) {
      logger.error('Question.bulkCreate error', { error: err.message, interviewId });
      throw new DatabaseError('Failed to bulk create questions', err);
    }
  },

  /**
   * Find questions by interview ID
   */
  async findByInterviewId(interviewId) {
    try {
      const result = await query(
        `SELECT * FROM questions WHERE interview_id = $1 ORDER BY order_index ASC`,
        [interviewId]
      );
      return result.rows;
    } catch (err) {
      logger.error('Question.findByInterviewId error', { error: err.message, interviewId });
      throw new DatabaseError('Failed to find questions', err);
    }
  },

  /**
   * Find a single question by ID
   */
  async findById(id) {
    try {
      const result = await query(`SELECT * FROM questions WHERE id = $1`, [id]);
      return result.rows[0] || null;
    } catch (err) {
      logger.error('Question.findById error', { error: err.message, id });
      throw new DatabaseError('Failed to find question', err);
    }
  },

  /**
   * Update question
   */
  async update(id, data) {
    const { question_text, expected_keywords, time_limit_seconds } = data;
    try {
      const result = await query(
        `UPDATE questions SET
           question_text = COALESCE($1, question_text),
           expected_keywords = COALESCE($2, expected_keywords),
           time_limit_seconds = COALESCE($3, time_limit_seconds)
         WHERE id = $4 RETURNING *`,
        [question_text, expected_keywords ? JSON.stringify(expected_keywords) : null, time_limit_seconds, id]
      );
      return result.rows[0] || null;
    } catch (err) {
      logger.error('Question.update error', { error: err.message, id });
      throw new DatabaseError('Failed to update question', err);
    }
  },

  /**
   * Delete all questions for an interview
   */
  async deleteByInterviewId(interviewId) {
    try {
      await query(`DELETE FROM questions WHERE interview_id = $1`, [interviewId]);
      return true;
    } catch (err) {
      logger.error('Question.deleteByInterviewId error', { error: err.message });
      throw new DatabaseError('Failed to delete questions', err);
    }
  },
};

module.exports = Question;
