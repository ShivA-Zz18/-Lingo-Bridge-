const axios = require("axios");

/**
 * DigiLocker Integration Controller
 * Uses DigiLocker sandbox APIs. Falls back to demo mode if credentials missing.
 */

const DIGILOCKER_BASE = "https://api.digitallocker.gov.in/public/oauth2/1";
const DEMO_DOCUMENTS = [
  {
    id: "demo-aadhaar-001",
    name: "Aadhaar Card",
    type: "AADHAAR",
    issuer: "UIDAI",
    date: "2024-01-15",
    description: "Unique Identification Authority of India",
  },
  {
    id: "demo-pan-001",
    name: "PAN Card",
    type: "PANCR",
    issuer: "Income Tax Department",
    date: "2023-06-20",
    description: "Permanent Account Number",
  },
  {
    id: "demo-dl-001",
    name: "Driving License",
    type: "DRVLC",
    issuer: "Transport Department",
    date: "2022-11-10",
    description: "State Transport Authority",
  },
  {
    id: "demo-marksheet-001",
    name: "Class 10 Marksheet",
    type: "EDCRT",
    issuer: "CBSE",
    date: "2020-07-25",
    description: "Central Board of Secondary Education",
  },
  {
    id: "demo-ration-001",
    name: "Ration Card",
    type: "RTNCD",
    issuer: "Food & Civil Supplies",
    date: "2023-03-12",
    description: "State Food & Civil Supplies Department",
  },
];

const isDemoMode = () => {
  return !process.env.DIGILOCKER_CLIENT_ID || !process.env.DIGILOCKER_CLIENT_SECRET;
};

// ── OAuth: redirect to DigiLocker ──────────────────────────
const authorize = (req, res) => {
  if (isDemoMode()) {
    return res.json({
      success: true,
      demo: true,
      message: "DigiLocker running in demo mode. No OAuth required.",
      documents: DEMO_DOCUMENTS,
    });
  }

  const authUrl =
    `${DIGILOCKER_BASE}/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.DIGILOCKER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI)}&` +
    `state=lingo-bridge`;

  res.json({ success: true, authUrl });
};

// ── OAuth callback ─────────────────────────────────────────
const callback = async (req, res) => {
  try {
    if (isDemoMode()) {
      return res.redirect("http://localhost:5173/digilocker?demo=true");
    }

    const { code } = req.query;
    const tokenResponse = await axios.post(`${DIGILOCKER_BASE}/token`, {
      code,
      grant_type: "authorization_code",
      client_id: process.env.DIGILOCKER_CLIENT_ID,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
      redirect_uri: process.env.DIGILOCKER_REDIRECT_URI,
    });

    const { access_token } = tokenResponse.data;
    res.redirect(
      `http://localhost:5173/digilocker?token=${access_token}`
    );
  } catch (error) {
    console.error("DigiLocker callback error:", error.message);
    res.redirect("http://localhost:5173/digilocker?error=auth_failed");
  }
};

// ── List documents ─────────────────────────────────────────
const listDocuments = async (req, res) => {
  if (isDemoMode()) {
    return res.json({ success: true, demo: true, data: DEMO_DOCUMENTS });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await axios.get(
      "https://api.digitallocker.gov.in/public/oauth2/2/files/issued",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Import a document for simplification ───────────────────
const importDocument = async (req, res) => {
  if (isDemoMode()) {
    // Return a demo document image path for simplification
    return res.json({
      success: true,
      demo: true,
      message: "Demo mode: Use the Document Scanner to upload a real image for simplification.",
      document: DEMO_DOCUMENTS.find((d) => d.id === req.body.documentId) || DEMO_DOCUMENTS[0],
    });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { uri } = req.body;
    const response = await axios.get(uri, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(response.data).toString("base64");
    res.json({ success: true, data: { base64, mimeType: "application/pdf" } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authorize, callback, listDocuments, importDocument };
