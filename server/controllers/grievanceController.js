const { GoogleGenerativeAI } = require("@google/generative-ai");
const GRIEVANCE_DRAFTSMAN_PROMPT = require("../prompts/grievanceDraftsman");

const draftGrievance = async (req, res) => {
  try {
    const { documentContext, userIntent, language } = req.body;

    if (!documentContext || !userIntent) {
      return res
        .status(400)
        .json({ error: "documentContext and userIntent are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = `
Document Context:
${documentContext}

User Intent: ${userIntent}
Target Language: ${language || "en"}

Please draft the appropriate letter based on the above.
`;

    const result = await model.generateContent([
      { text: GRIEVANCE_DRAFTSMAN_PROMPT },
      { text: userMessage },
    ]);

    const responseText = result.response.text();

    let parsed;
    try {
      const cleanJson = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        draftLetter: responseText,
        draftLetterKannada: "",
        draftLetterHindi: "",
        formatType: userIntent,
        tips: ["Review the draft carefully before submission."],
        disclaimer:
          "This is an AI-generated draft. Please review it with a local legal aid centre before submitting.",
        submitTo: "Relevant Authority",
      };
    }

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Grievance draft error:", error);
    res.status(500).json({ error: error.message || "Failed to draft grievance" });
  }
};

module.exports = { draftGrievance };
