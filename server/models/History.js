const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    originalText: { type: String },
    simplifiedText: { type: String },
    simplifiedKannada: { type: String },
    simplifiedHindi: { type: String },
    jargonTerms: [
      {
        term: String,
        meaning: String,
      },
    ],
    language: { type: String, default: "en" },
    dialect: { type: String, default: "standard" },
    imageUrl: { type: String },
    confidence: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    sourceRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
