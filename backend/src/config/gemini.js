'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

let geminiClient = null;
let model = null;

/**
 * Initialize Gemini client
 */
function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set — AI features will use fallback mocks');
    return;
  }

  try {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    model = geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        thinkingConfig: { thinkingBudget: 0 }, // disable thinking for faster responses
      },
    });
    logger.info('Gemini AI client initialized', { model: modelName });
  } catch (err) {
    logger.error('Failed to initialize Gemini AI', { error: err.message });
  }
}

/**
 * Generate content with retry logic
 * @param {string} prompt - The prompt to send
 * @param {object} options - Generation config
 * @param {number} maxRetries - Number of retries
 * @returns {Promise<string>} Generated text
 */
async function generateContent(prompt, options = {}, maxRetries = 3) {
  if (!model) {
    throw new Error('Gemini model not initialized');
  }

  const generationConfig = {
    temperature: options.temperature || 0.7,
    topK: options.topK || 40,
    topP: options.topP || 0.95,
    maxOutputTokens: options.maxOutputTokens || 2048,
    ...options,
  };

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      logger.debug('Gemini content generated', {
        promptLength: prompt.length,
        responseLength: text.length,
        attempt,
      });

      return text;
    } catch (err) {
      lastError = err;
      logger.error(`Gemini attempt ${attempt}/${maxRetries} failed`, {
        error: err.message,
      });

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Generate structured JSON content from Gemini
 * @param {string} prompt - Prompt instructing JSON output
 * @param {object} options - Generation config
 * @returns {Promise<object>} Parsed JSON object
 */
async function generateJSON(prompt, options = {}) {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no code blocks, no explanations.`;
  const text = await generateContent(jsonPrompt, { temperature: 0.3, ...options });

  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleaned);
}

// Initialize on module load
initGemini();

module.exports = { geminiClient, model, generateContent, generateJSON, initGemini };
