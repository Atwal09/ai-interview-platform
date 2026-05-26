'use strict';

const { FILLER_WORDS, ACTION_VERBS } = require('../utils/constants');
const logger = require('../config/logger');

/**
 * Count filler words in transcript text
 * @param {string} text - Transcript text
 * @returns {object} { count, found, percentage }
 */
function countFillerWords(text) {
  if (!text) return { count: 0, found: [], percentage: 0 };

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const found = [];
  let count = 0;

  for (const fw of FILLER_WORDS) {
    const regex = new RegExp(`\\b${fw.replace(/\s/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex) || [];
    if (matches.length > 0) {
      found.push({ word: fw, count: matches.length });
      count += matches.length;
    }
  }

  const percentage = wordCount > 0 ? Math.round((count / wordCount) * 1000) / 10 : 0;
  return { count, found, percentage };
}

/**
 * Find frequently repeated words (excluding common stop words)
 * @param {string} text - Transcript text
 * @returns {Array} Array of { word, count } objects
 */
function findRepeatedWords(text) {
  if (!text) return [];

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'this', 'that', 'these', 'those', 'i', 'we', 'you', 'he',
    'she', 'it', 'they', 'my', 'your', 'his', 'her', 'our', 'their', 'its',
  ]);

  const wordFreq = {};
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

  words.forEach((word) => {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return Object.entries(wordFreq)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Detect potentially incomplete sentences
 * @param {string} text - Transcript text
 * @returns {number} Count of incomplete sentences
 */
function detectIncompleteSentences(text) {
  if (!text) return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  let incompleteCount = 0;

  sentences.forEach((sentence) => {
    const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 3) incompleteCount++;
  });

  return incompleteCount;
}

/**
 * Estimate speaking pace from word count (assumes average recording)
 * @param {number} wordCount - Number of words
 * @param {number} durationSeconds - Recording duration in seconds (optional)
 * @returns {object} { wpm, pace_label }
 */
function estimateSpeakingPace(wordCount, durationSeconds = null) {
  let wpm;

  if (durationSeconds && durationSeconds > 0) {
    wpm = Math.round((wordCount / durationSeconds) * 60);
  } else {
    // Default: assume 2 minutes for 150 words average response
    wpm = Math.round(wordCount / 2);
  }

  let pace;
  if (wpm < 90) pace = 'very_slow';
  else if (wpm < 120) pace = 'slow';
  else if (wpm < 160) pace = 'moderate';
  else if (wpm < 200) pace = 'fast';
  else pace = 'very_fast';

  return { wpm, pace };
}

/**
 * Calculate vocabulary richness (unique word ratio)
 * @param {string} text
 * @returns {number} 0-100 score
 */
function calculateVocabularyScore(text) {
  if (!text) return 0;

  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  if (words.length === 0) return 0;

  const uniqueWords = new Set(words);
  const ratio = uniqueWords.size / words.length;
  return Math.round(Math.min(ratio * 150, 100));
}

/**
 * Calculate grammar score (simple heuristic)
 * @param {string} text
 * @returns {number} 0-100 score
 */
function calculateGrammarScore(text) {
  if (!text) return 0;

  let score = 100;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  sentences.forEach((sentence) => {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    // Penalize very short sentences
    if (words.length < 3) score -= 5;
    // Penalize starting with lowercase (excluding intentional)
    if (sentence.trim() && /^[a-z]/.test(sentence.trim())) score -= 2;
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze a speech transcript for quality metrics
 * @param {string} text - Transcript text
 * @param {number} durationSeconds - Optional recording duration
 * @returns {object} Comprehensive speech analysis
 */
function analyzeTranscript(text, durationSeconds = null) {
  if (!text || text.trim().length === 0) {
    return {
      error: 'No transcript provided',
      overall_speech_score: 0,
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const fillerAnalysis = countFillerWords(text);
  const repeatedWords = findRepeatedWords(text);
  const incompleteSentences = detectIncompleteSentences(text);
  const { wpm, pace } = estimateSpeakingPace(wordCount, durationSeconds);
  const vocabularyScore = calculateVocabularyScore(text);
  const grammarScore = calculateGrammarScore(text);

  // Clarity score based on filler words
  const clarityScore = Math.max(0, Math.round(100 - fillerAnalysis.percentage * 4));

  // Confidence score
  const confidenceScore = Math.max(0, Math.round(
    100 - fillerAnalysis.count * 3 - incompleteSentences * 5
  ));

  // Overall score
  const overallScore = Math.round(
    (clarityScore * 0.3 + grammarScore * 0.25 + vocabularyScore * 0.2 + confidenceScore * 0.25)
  );

  const strengths = [];
  const improvements = [];

  if (fillerAnalysis.percentage < 3) strengths.push('Minimal filler words — excellent speech control');
  else improvements.push(`Reduce filler words (${fillerAnalysis.count} found: ${fillerAnalysis.found.slice(0, 3).map((f) => f.word).join(', ')})`);

  if (pace === 'moderate') strengths.push('Speaking pace is ideal for comprehension');
  else if (pace === 'very_fast') improvements.push('Slow down — speaking too fast reduces clarity');
  else if (pace === 'very_slow') improvements.push('Increase speaking pace to maintain engagement');

  if (vocabularyScore > 70) strengths.push('Rich vocabulary demonstrates strong command of language');
  else improvements.push('Expand vocabulary — use more varied and precise words');

  if (grammarScore > 80) strengths.push('Grammar is clear and professional');
  else improvements.push('Review grammar — work on sentence structure and completeness');

  if (repeatedWords.length > 3) {
    improvements.push(`Avoid repetition of words: ${repeatedWords.slice(0, 3).map((r) => r.word).join(', ')}`);
  }

  return {
    word_count: wordCount,
    duration_seconds: durationSeconds,
    filler_word_count: fillerAnalysis.count,
    filler_words_found: fillerAnalysis.found.map((f) => f.word),
    filler_word_percentage: fillerAnalysis.percentage,
    repeated_words: repeatedWords.map((r) => r.word),
    incomplete_sentences: incompleteSentences,
    speaking_pace: pace,
    words_per_minute: wpm,
    clarity_score: clarityScore,
    grammar_score: grammarScore,
    vocabulary_score: vocabularyScore,
    confidence_score: confidenceScore,
    overall_speech_score: overallScore,
    strengths,
    improvements,
  };
}

/**
 * Process raw audio metrics from client
 * @param {object} audioData - Audio metrics from browser recording API
 * @returns {object} Processed metrics
 */
function processAudioMetrics(audioData = {}) {
  return {
    speaking_rate: audioData.speaking_rate || null,
    pause_count: audioData.pause_count || 0,
    average_pause_duration: audioData.avg_pause || 0,
    total_pause_duration: audioData.total_pause || 0,
    volume_variance: audioData.volume_variance || null,
    tone: audioData.tone || 'neutral',
  };
}

/**
 * Generate a full speech analysis report combining transcript + audio metrics
 * @param {string} transcript - Speech text
 * @param {object} metrics - Audio metrics
 * @returns {object} Full report
 */
function generateSpeechReport(transcript, metrics = {}) {
  const transcriptAnalysis = analyzeTranscript(transcript, metrics.duration_seconds);
  const audioMetrics = processAudioMetrics(metrics);

  // If we have a recorded speaking rate, use it
  if (audioMetrics.speaking_rate && transcriptAnalysis.words_per_minute) {
    transcriptAnalysis.words_per_minute = audioMetrics.speaking_rate;
  }

  const detailed_feedback = [
    `Overall speech quality score: ${transcriptAnalysis.overall_speech_score}/100.`,
    transcriptAnalysis.filler_word_count > 5
      ? ` Detected ${transcriptAnalysis.filler_word_count} filler words — focus on pausing instead of using fillers.`
      : ' Excellent control of filler words.',
    transcriptAnalysis.speaking_pace === 'moderate'
      ? ' Speaking pace is ideal.'
      : ` Consider adjusting your ${transcriptAnalysis.speaking_pace === 'fast' ? 'faster' : 'slower'} speaking pace.`,
  ].join('');

  return {
    ...transcriptAnalysis,
    audio_metrics: audioMetrics,
    detailed_feedback,
    tone: transcriptAnalysis.confidence_score > 70 ? 'confident' : 'nervous',
    generated_at: new Date().toISOString(),
  };
}

module.exports = {
  analyzeTranscript,
  countFillerWords,
  findRepeatedWords,
  detectIncompleteSentences,
  estimateSpeakingPace,
  calculateVocabularyScore,
  calculateGrammarScore,
  processAudioMetrics,
  generateSpeechReport,
};
