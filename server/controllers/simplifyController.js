const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const History = require("../models/History");
const VILLAGE_ASSISTANT_PROMPT = require("../prompts/villageAssistant");

// ── Multer config ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|gif|webp|bmp|tiff|pdf|docx|doc/;
    const allowedMimes = /image\/(jpeg|jpg|png|gif|webp|bmp|tiff)|application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/msword/;
    const ext = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMimes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Allowed: images (JPG, PNG, WebP), PDF, or Word (.docx) files"), false);
    }
  },
});

// ── Helper: extract text from PDF ──────────────────────────
async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// ── Helper: extract text from DOCX ─────────────────────────
async function extractDocxText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// ── Detect file type ───────────────────────────────────────
function getFileType(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".pdf"].includes(ext)) return "pdf";
  if ([".docx", ".doc"].includes(ext)) return "docx";
  return "image";
}

// ── Simplify controller ────────────────────────────────────
const simplifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fileType = getFileType(req.file);
    let result;

    if (fileType === "pdf") {
      // ── PDF: extract text, send as text prompt ───────────
      const text = await extractPdfText(req.file.path);
      if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: "Could not extract text from PDF. It may be a scanned document — try uploading as an image instead." });
      }
      result = await model.generateContent([
        { text: VILLAGE_ASSISTANT_PROMPT },
        { text: `Here is the document text:\n\n${text}` },
      ]);
    } else if (fileType === "docx") {
      // ── DOCX: extract text, send as text prompt ──────────
      const text = await extractDocxText(req.file.path);
      if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: "Could not extract text from the Word document." });
      }
      result = await model.generateContent([
        { text: VILLAGE_ASSISTANT_PROMPT },
        { text: `Here is the document text:\n\n${text}` },
      ]);
    } else {
      // ── Image: send as inline image ──────────────────────
      const imageData = fs.readFileSync(req.file.path);
      const base64Image = imageData.toString("base64");
      const mimeType = req.file.mimetype;
      result = await model.generateContent([
        { text: VILLAGE_ASSISTANT_PROMPT },
        { inlineData: { mimeType, data: base64Image } },
      ]);
    }

    const responseText = result.response.text();

    // Parse JSON from Gemini response
    let parsed;
    try {
      const cleanJson = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        originalText: responseText,
        simplifiedText: responseText,
        simplifiedKannada: "",
        simplifiedHindi: "",
        jargonTerms: [],
        confidence: "low",
        sourceRef: "N/A",
      };
    }

    // Save to history
    const history = await History.create({
      originalText: parsed.originalText,
      simplifiedText: parsed.simplifiedText,
      simplifiedKannada: parsed.simplifiedKannada,
      simplifiedHindi: parsed.simplifiedHindi,
      jargonTerms: parsed.jargonTerms || [],
      language: req.body.language || "en",
      dialect: req.body.dialect || "standard",
      imageUrl: `/uploads/${req.file.filename}`,
      confidence: parsed.confidence || "medium",
      sourceRef: parsed.sourceRef || "N/A",
    });

    res.json({
      success: true,
      data: {
        ...parsed,
        historyId: history._id,
        imageUrl: `/uploads/${req.file.filename}`,
        fileType,
      },
    });
  } catch (error) {
    console.error("Simplify error:", error);
    res.status(500).json({ error: error.message || "Failed to simplify document" });
  }
};

// ── Get history ────────────────────────────────────────────
const getHistory = async (_req, res) => {
  try {
    const history = await History.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, simplifyDocument, getHistory };
