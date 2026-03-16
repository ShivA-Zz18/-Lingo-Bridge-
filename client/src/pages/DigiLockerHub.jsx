import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Link2, FileText, Shield, ExternalLink, Lock } from "lucide-react";
import GlassCard from "../components/GlassCard";
import LoadingOrb from "../components/LoadingOrb";

const DOC_ICONS = { AADHAAR: "🪪", PANCR: "💳", DRVLC: "🚗", EDCRT: "🎓", RTNCD: "🍚" };
const DOC_COLORS = {
  AADHAAR: "from-orange-500/20 to-green-500/20",
  PANCR: "from-blue-500/20 to-cyan-500/20",
  DRVLC: "from-amber-500/20 to-red-500/20",
  EDCRT: "from-purple-500/20 to-blue-500/20",
  RTNCD: "from-green-500/20 to-emerald-500/20",
};

export default function DigiLockerHub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setConnected(true);
      setIsDemo(true);
      fetchDocuments();
    } else if (searchParams.get("token")) {
      setConnected(true);
      fetchDocuments();
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/digilocker/auth");
      if (data.demo) {
        setConnected(true);
        setIsDemo(true);
        setDocuments(data.documents || []);
      } else if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to connect DigiLocker");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get("/api/digilocker/documents");
      setDocuments(data.data || []);
      setIsDemo(data.demo || false);
    } catch {
      // handled by demo mode
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          <span className="gradient-text">DigiLocker Hub</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Securely access and simplify your government-issued digital documents
        </p>

        {!connected ? (
          /* ── Connect Screen ───────────────────────────── */
          <div className="flex flex-col items-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/25 border border-white/10">
                🔐
              </div>
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 blur-2xl opacity-15 animate-glow-pulse" />
            </motion.div>

            <h2 className="text-xl font-bold mb-2">Connect Your DigiLocker</h2>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-md mb-8 leading-relaxed">
              Securely access your Aadhaar, PAN, driving license, and other government documents.
              Then simplify any document with one click using AI.
            </p>

            <button
              id="connect-digilocker"
              onClick={handleConnect}
              disabled={loading}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
            >
              <Link2 size={20} /> {loading ? "Connecting…" : "Connect DigiLocker"}
            </button>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                <Shield size={12} /> OAuth 2.0 Secured
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                <Lock size={12} /> No credentials stored
              </div>
            </div>
          </div>
        ) : (
          /* ── Connected State ──────────────────────────── */
          <>
            {/* Status */}
            <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl glass-subtle">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">
                DigiLocker Connected
              </span>
              {isDemo && (
                <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/15 ml-auto">
                  Demo Mode
                </span>
              )}
            </div>

            {loading ? (
              <LoadingOrb text="Fetching your documents…" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc, i) => (
                  <motion.div
                    key={doc.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <GlassCard className="flex flex-col h-full">
                      {/* Colored header bar */}
                      <div className={`-mx-6 -mt-6 mb-4 px-6 pt-5 pb-4 rounded-t-[15px] bg-gradient-to-r ${DOC_COLORS[doc.type] || "from-purple-500/10 to-blue-500/10"}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{DOC_ICONS[doc.type] || "📄"}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{doc.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{doc.issuer}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mb-1 leading-relaxed">{doc.description}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mb-4">Issued: {doc.date}</p>

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => navigate("/scanner")}
                          className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5 flex-1 justify-center"
                        >
                          <FileText size={13} /> Simplify
                        </button>
                        <a
                          href={doc.type === "AADHAAR" ? "https://myaadhaar.uidai.gov.in/" : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1 no-underline"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
