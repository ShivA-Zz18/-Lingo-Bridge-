'use strict';

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER CLIENTS (Single Source of Truth)
// Primary:  OpenRouter (free-tier LLM models via OpenAI-compatible API)
// Failover: Google Gemini 1.5 Flash
// ─────────────────────────────────────────────────────────────────────────────

const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Prioritized list of OpenRouter free-tier models to attempt in sequence.
 * The pipeline tries each model from first to last, skipping any that return 404.
 * Update this list when models are deprecated — check https://openrouter.ai/models?q=free
 *
 * @constant {string[]}
 */
const FREE_TIER_MODEL_PRIORITY_LIST = [
  'meta-llama/llama-3.3-70b-instruct:free',  // Confirmed active March 2026
  'meta-llama/llama-3.2-3b-instruct:free',   // Lightweight fallback
  'google/gemma-3-27b-it:free',              // Google Gemma — stable free tier
  'google/gemma-3-12b-it:free',              // Smaller Gemma variant
];

/**
 * Gemini failover model, activated when the entire OpenRouter pipeline is exhausted.
 * @constant {string}
 */
const GEMINI_FAILOVER_MODEL = 'gemini-1.5-flash';

/**
 * Exponential backoff delay intervals (in ms) for retrying rate-limited AI calls.
 * Index corresponds to the retry attempt: [attempt-1, attempt-2, attempt-3].
 * @constant {number[]}
 */
const BACKOFF_SCHEDULE_MS = [5000, 10000, 20000];

/**
 * Utility: returns a promise that resolves after `ms` milliseconds.
 *
 * @param {number} ms - Duration to wait in milliseconds.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core AI inference pipeline with model-level fallback, exponential backoff, and Gemini failover.
 *
 * Attempt order:
 * 1. PRIMARY_INFERENCE_MODEL (mistral-7b-instruct:free)
 * 2. SECONDARY_INFERENCE_MODEL (mistral-nemo:free) — only if primary returns 404
 * 3. Exponential backoff retries on 429/5xx
 * 4. GEMINI_FAILOVER_MODEL — activated when all OpenRouter retries are exhausted
 *
 * @async
 * @param {string} aiInferencePrompt - The full prompt to send to the AI model.
 * @param {string} [modelName=PRIMARY_INFERENCE_MODEL] - The OpenRouter model identifier to use.
 * @param {number} [maxRetries=3] - Maximum retry attempts before triggering Gemini failover.
 * @returns {Promise<Object>} Parsed JSON object returned by the AI model.
 * @throws {Error} Throws if both the OpenRouter pipeline and Gemini failover both fail.
 */
const callAIPipeline = async (
  aiInferencePrompt,
  modelName = null,
  maxRetries = 3
) => {
  // Use the caller's model if specified, otherwise walk the full priority list.
  const modelsToAttempt = modelName ? [modelName] : [...FREE_TIER_MODEL_PRIORITY_LIST];
  let lastProviderError = null;

  for (const currentModel of modelsToAttempt) {
    // ── Per-model attempt with exponential backoff for rate-limit errors ──
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const completion = await openRouterClient.chat.completions.create({
          messages: [{ role: 'user', content: aiInferencePrompt }],
          model: currentModel,
          response_format: { type: 'json_object' },
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (providerError) {
        // 404 = model endpoint removed from OpenRouter — skip to next model immediately.
        if (providerError.status === 404) {
          logger.warn(`OpenRouter model '${currentModel}' returned 404 (endpoint removed). Trying next...`);
          break;
        }

        const isRetryable =
          providerError.status === 429 ||
          providerError.status >= 500 ||
          providerError.message?.toLowerCase().includes('rate limit');

        if (!isRetryable) {
          throw providerError;
        }

        logger.warn(`OpenRouter rate-limited on '${currentModel}' (attempt ${attempt + 1}/${maxRetries + 1}): ${providerError.message}`);
        lastProviderError = providerError;

        if (attempt < maxRetries) {
          const backoffMs = BACKOFF_SCHEDULE_MS[attempt] || 20000;
          logger.info(`Backoff: waiting ${backoffMs}ms before retry attempt ${attempt + 2}...`);
          await delay(backoffMs);
        }
      }
    }
  }

  // ── All OpenRouter models failed — activate Gemini failover ──────────────
  logger.info('All OpenRouter models exhausted. Activating Gemini 1.5 Flash failover...');
  try {
    const geminiModel = geminiClient.getGenerativeModel({
      model: GEMINI_FAILOVER_MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    });
    const geminiResponse = await geminiModel.generateContent(aiInferencePrompt);
    const rawGeminiText = geminiResponse.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();
    return JSON.parse(rawGeminiText || '{}');
  } catch (geminiFailoverError) {
    logger.error(`Gemini failover failed: ${geminiFailoverError.message}`);
    throw new Error(
      `Both AI pipelines exhausted. Last OpenRouter error: ${lastProviderError?.message || 'unknown'}. Gemini error: ${geminiFailoverError.message}`
    );
  }
};

/**
 * Generates a multilingual, eligibility-scored job summary for a given job listing.
 *
 * @async
 * @param {Object} jobData - Raw job object from the scraper/aggregator.
 * @param {string} jobData.title - The job title.
 * @param {string} [jobData.description] - Full job description text.
 * @param {string} [jobData.qualifications] - Required qualifications string.
 * @param {string} [jobData.sector] - Job sector (e.g., 'Government', 'Private').
 * @param {string} [jobData.source] - Source website name.
 * @param {string} [jobData.url] - Direct application link.
 * @param {string} [jobData.last_date] - Application deadline.
 * @param {Object} candidateProfile - The user's academic and skill profile for eligibility matching.
 * @param {string} candidateProfile.degree - Candidate's highest degree.
 * @param {string[]} candidateProfile.skills - List of candidate's technical skills.
 * @param {string} candidateProfile.preferredRole - Candidate's preferred job role.
 * @param {string} [userLanguage='English'] - The user's preferred display language.
 * @param {string} [userLocation='Karnataka'] - The user's geographic location.
 * @param {string} [searchIntent=''] - The original search query (primary eligibility scoring factor).
 * @returns {Promise<Object>} AI-generated job summary object, or a graceful degradation stub on failure.
 */
const smartSummarizeJob = async (
  jobData,
  candidateProfile,
  userLanguage = 'English',
  userLocation = 'Karnataka',
  searchIntent = ''
) => {
  const jobTextCorpus = (
    `${jobData.title} ${jobData.description || ''} ${jobData.qualifications || ''}`
  ).toLowerCase();

  const KARNATAKA_REGION_KEYWORDS = ['karnataka', 'bangalore', 'mangalore', 'udupi', 'dakshina kannada'];
  const localAdvantageTag =
    KARNATAKA_REGION_KEYWORDS.some((kw) => jobTextCorpus.includes(kw)) || userLocation !== 'Global'
      ? 'Karnataka Region Role'
      : null;

  const aiInferencePrompt = `
    You are an expert career counselor in India.
    Analyze the following job details against the User's Search Intent and Profile, then provide a structured JSON response.

    [USER SEARCH INTENT]
    Search Query: "${searchIntent}"

    [USER PROFILE]
    Degree: ${candidateProfile.degree || 'Student'}
    Skills: ${Array.isArray(candidateProfile.skills) ? candidateProfile.skills.join(', ') : candidateProfile.skills || 'None'}
    Preferred Role: ${candidateProfile.preferredRole || 'Any Entry Level'}
    Location: ${userLocation}

    [JOB DETAILS]
    Job Title: ${jobData.title || 'N/A'}
    Sector: ${jobData.sector || 'Private'}
    Source: ${jobData.source || 'N/A'}
    Qualifications required: ${jobData.qualifications || 'N/A'}
    Job Description: ${jobData.description || 'N/A'}

    [LOGIC INSTRUCTIONS]
    1. Calculate an "eligibility_score" (0-100). The HIGHEST scoring factor is match with the Search Query ("${searchIntent}"). Scores 90-100 for strong match, below 40 for a mismatch.
    2. Write a 2-sentence summary simultaneously in ALL THREE LANGUAGES: English, Hindi, and Kannada.
    3. PIVOT DETECTION: If the job is in a completely different industry than the user's profile, include the phrase "You are eligible, but this is a career pivot" in all three summaries natively.

    Return ONLY a valid JSON object with EXACTLY this schema:
    {
      "title": "<Extract actual job title here>",
      "eligibility_score": <number 0-100>,
      "summary_english": "<2-sentence summary strictly in English>",
      "summary_hindi": "<2-sentence summary strictly in Hindi>",
      "summary_kannada": "<2-sentence summary strictly in Kannada>",
      "apply_link": "${jobData.url || ''}",
      "last_date": "${jobData.last_date || 'Not Specified'}",
      "source_reliability_rating": "High/Medium/Low",
      "local_advantage": ${localAdvantageTag ? `"${localAdvantageTag}"` : 'null'},
      "sector": "${jobData.sector || 'Private'}"
    }
  `;

  try {
    const extractedJobMetadata = await callAIPipeline(aiInferencePrompt);

    if (!extractedJobMetadata.local_advantage && localAdvantageTag) {
      extractedJobMetadata.local_advantage = localAdvantageTag;
    }
    if (extractedJobMetadata.title === '<Extract actual job title here>') {
      extractedJobMetadata.title = jobData.title;
    }

    return extractedJobMetadata;
  } catch (pipelineError) {
    logger.error(`smartSummarizeJob failed for "${jobData.title}": ${pipelineError.message}`);

    return {
      title: jobData.title,
      eligibility_score: 50,
      summary_english: 'Summary unavailable',
      summary_hindi: 'Summary unavailable',
      summary_kannada: 'Summary unavailable',
      apply_link: jobData.url,
      last_date: jobData.last_date || 'Not Specified',
      source_reliability_rating: 'Medium',
      local_advantage: localAdvantageTag,
      sector: jobData.sector || 'Private',
    };
  }
};

module.exports = { smartSummarizeJob };
