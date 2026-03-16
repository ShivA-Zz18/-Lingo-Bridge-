const Scheme = require("../models/Scheme");

// ── Match schemes to user profile ──────────────────────────
const matchSchemes = async (req, res) => {
  try {
    const { age, income, occupation } = req.body;

    if (!age || !income || !occupation) {
      return res
        .status(400)
        .json({ error: "Please provide age, income, and occupation" });
    }

    const query = {
      isActive: true,
      "eligibility.ageMin": { $lte: Number(age) },
      "eligibility.ageMax": { $gte: Number(age) },
    };

    // Income filter — only apply if scheme has a defined max
    if (income) {
      query["eligibility.incomeMax"] = { $gte: Number(income) };
    }

    let schemes = await Scheme.find(query).lean();

    // Filter by occupation (if scheme specifies allowed occupations)
    schemes = schemes.filter((s) => {
      const occ = s.eligibility?.occupations || [];
      return occ.length === 0 || occ.includes("all") || occ.includes(occupation.toLowerCase());
    });

    // Calculate match percentage for UI delight
    const results = schemes.map((s) => {
      let matchScore = 60; // base
      const occ = s.eligibility?.occupations || [];
      if (occ.includes(occupation.toLowerCase())) matchScore += 20;
      if (Number(income) <= (s.eligibility?.incomeMax || Infinity) * 0.5) matchScore += 10;
      if (Number(age) >= (s.eligibility?.ageMin || 0) + 5) matchScore += 10;
      matchScore = Math.min(matchScore, 100);

      return {
        ...s,
        matchPercent: matchScore,
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchPercent - a.matchPercent);

    res.json({
      success: true,
      total: results.length,
      profile: { age, income, occupation },
      data: results,
    });
  } catch (error) {
    console.error("Scheme match error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ── Get all schemes ────────────────────────────────────────
const getAllSchemes = async (_req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: schemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { matchSchemes, getAllSchemes };
