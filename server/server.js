require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ─────────────────────────────────────────────
app.use("/api/simplify", require("./routes/simplify"));
app.use("/api/schemes", require("./routes/schemes"));
app.use("/api/grievance", require("./routes/grievance"));
app.use("/api/digilocker", require("./routes/digilocker"));

// ── Health Check ───────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", name: "Lingo-Bridge API", time: new Date() })
);

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Lingo-Bridge server running on http://localhost:${PORT}`)
  );
});
