'use strict';

const { query } = require('../config/database');
const logger = require('../config/logger');
const { DatabaseError } = require('../utils/errors');

/**
 * AIFeedback model — stores AI-generated feedback for various entities
 */
const AIFeedback = {
  /**
   * Create a new AI feedback record
   */
  async create(data) {
    const {
      entity_type, // 'interview', 'response', 'resume', 'speech'
      entity_id,
      user_id,
      feedback_type, // 'analysis', 'improvement_plan', 'speech_report', etc.
      content,
      model_used = null,
      tokens_used = null,
    } = data;

    try {
      const result = await query(
        `INSERT INTO ai_feedbacks (entity_type, entity_id, user_id, feedback_type,
                                   content, model_used, tokens_used, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          entity_type,
          entity_id,
          user_id,
          feedback_type,
          JSON.stringify(content),
          model_used,
          tokens_used,
        ]
      );
      return result.rows[0];
    } catch (err) {
      logger.error('AIFeedback.create error', { error: err.message });
      throw new DatabaseError('Failed to create AI feedback', err);
    }
  },

  /**
   * Find feedback by entity (entity_type + entity_id)
   */
  async findByEntityId(entityType, entityId) {
    try {
      const result = await query(
        `SELECT * FROM ai_feedbacks
         WHERE entity_type = $1 AND entity_id = $2
         ORDER BY created_at DESC`,
        [entityType, entityId]
      );
      return result.rows;
    } catch (err) {
      logger.error('AIFeedback.findByEntityId error', { error: err.message });
      throw new DatabaseError('Failed to find AI feedback', err);
    }
  },

  /**
   * Find latest feedback by entity
   */
  async findLatest(entityType, entityId, feedbackType = null) {
    try {
      const conditions = ['entity_type = $1', 'entity_id = $2'];
      const values = [entityType, entityId];

      if (feedbackType) {
        conditions.push(`feedback_type = $3`);
        values.push(feedbackType);
      }

      const result = await query(
        `SELECT * FROM ai_feedbacks
         WHERE ${conditions.join(' AND ')}
         ORDER BY created_at DESC LIMIT 1`,
        values
      );
      return result.rows[0] || null;
    } catch (err) {
      logger.error('AIFeedback.findLatest error', { error: err.message });
      throw new DatabaseError('Failed to find latest AI feedback', err);
    }
  },

  /**
   * Get AI usage statistics (admin)
   */
  async getUsageStats(days = 30) {
    try {
      const result = await query(
        `SELECT
           COUNT(*) as total_calls,
           SUM(tokens_used) as total_tokens,
           AVG(tokens_used) as avg_tokens,
           feedback_type,
           COUNT(*) as calls_by_type
         FROM ai_feedbacks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY feedback_type
         ORDER BY calls_by_type DESC`,
        []
      );
      return result.rows;
    } catch (err) {
      logger.error('AIFeedback.getUsageStats error', { error: err.message });
      throw new DatabaseError('Failed to get AI usage stats', err);
    }
  },
};

module.exports = AIFeedback;
