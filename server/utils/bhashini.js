const axios = require("axios");

/**
 * Bhashini API Helper
 * Supports translation, TTS, and ASR with regional dialect mapping.
 * Falls back gracefully if API keys are not configured.
 */

// ── Dialect Configuration ──────────────────────────────────
const DIALECT_MAP = {
  "standard-kannada": { code: "kn", script: "Knda", label: "ಕನ್ನಡ (Standard)" },
  "north-karnataka": { code: "kn", script: "Knda", label: "ಉತ್ತರ ಕರ್ನಾಟಕ", variant: "north" },
  "coastal": { code: "kn", script: "Knda", label: "ಕರಾವಳಿ", variant: "coastal" },
  "standard-hindi": { code: "hi", script: "Deva", label: "हिन्दी (Standard)" },
  "bhojpuri": { code: "bh", script: "Deva", label: "भोजपुरी", variant: "bhojpuri" },
  "rajasthani": { code: "raj", script: "Deva", label: "राजस्थानी", variant: "rajasthani" },
  "english": { code: "en", script: "Latn", label: "English" },
};

const BHASHINI_BASE = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model";

const isConfigured = () =>
  process.env.BHASHINI_API_KEY && process.env.BHASHINI_USER_ID;

/**
 * Get available dialects list for the frontend
 */
const getDialects = () =>
  Object.entries(DIALECT_MAP).map(([key, val]) => ({
    id: key,
    label: val.label,
    code: val.code,
  }));

/**
 * Translate text using Bhashini
 */
const translate = async (text, sourceLang = "en", targetDialect = "standard-hindi") => {
  if (!isConfigured()) {
    return {
      success: false,
      fallback: true,
      message: "Bhashini API not configured. Using Gemini translations instead.",
      translatedText: "",
    };
  }

  try {
    const dialect = DIALECT_MAP[targetDialect] || DIALECT_MAP["standard-hindi"];

    // Step 1: Get model pipeline
    const pipelineRes = await axios.post(
      `${BHASHINI_BASE}/getModelsPipeline`,
      {
        pipelineTasks: [{ taskType: "translation", config: { language: { sourceLanguage: sourceLang, targetLanguage: dialect.code } } }],
        pipelineRequestConfig: { pipelineId: "64392f96daac500b55c543cd" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          userID: process.env.BHASHINI_USER_ID,
          ulcaApiKey: process.env.BHASHINI_API_KEY,
        },
      }
    );

    const serviceId =
      pipelineRes.data?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;
    const callbackUrl =
      pipelineRes.data?.pipelineInferenceAPIEndPoint?.callbackUrl;

    if (!serviceId || !callbackUrl) {
      throw new Error("No service found for this language pair");
    }

    // Step 2: Perform translation
    const transRes = await axios.post(
      callbackUrl,
      {
        pipelineTasks: [
          {
            taskType: "translation",
            config: { language: { sourceLanguage: sourceLang, targetLanguage: dialect.code }, serviceId },
          },
        ],
        inputData: { input: [{ source: text }] },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: pipelineRes.data?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || "",
        },
      }
    );

    const translatedText =
      transRes.data?.pipelineResponse?.[0]?.output?.[0]?.target || "";

    return { success: true, translatedText, dialect: dialect.label };
  } catch (error) {
    console.error("Bhashini translate error:", error.message);
    return {
      success: false,
      fallback: true,
      message: error.message,
      translatedText: "",
    };
  }
};

module.exports = { getDialects, translate, DIALECT_MAP };
