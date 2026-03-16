import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ArrowRight, BookOpen, FileImage, FileType, Sparkles } from "lucide-react";
import GlassCard from "../components/GlassCard";
import DialectToggle from "../components/DialectToggle";
import VerifiedBadge from "../components/VerifiedBadge";
import LoadingOrb from "../components/LoadingOrb";

const FILE_TYPE_ICONS = {
  image: <FileImage size={40} className="text-cyan-400" />,
  pdf: <FileType size={40} className="text-red-400" />,
  docx: <FileText size={40} className="text-blue-400" />,
};

export default function DocumentScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [dialect, setDialect] = useState("standard-hindi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [langTab, setLangTab] = useState("en");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const detectFileType = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "pdf";
    if (["docx", "doc"].includes(ext)) return "docx";
    return "image";
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    const type = detectFileType(f);
    setFileType(type);
    if (type === "image") {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("dialect", dialect);
      const { data } = await axios.post("/api/simplify", fd);
      setResult(data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to process document");
    } finally {
      setLoading(false);
    }
  };

  const LANG_TABS = [
    { id: "en", label: "English" },
    { id: "kn", label: "ಕನ್ನಡ" },
    { id: "hi", label: "हिन्दी" },
  ];

  const getSimplifiedText = () => {
    if (!result) return "";
    if (langTab === "kn") return result.simplifiedKannada || "Translation not available";
    if (langTab === "hi") return result.simplifiedHindi || "Translation not available";
    return result.simplifiedText || "";
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Document Scanner</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Upload an image, PDF, or Word document — AI simplifies it instantly
          </p>
        </div>
        <DialectToggle value={dialect} onChange={setDialect} />
      </div>

      {/* Upload Zone */}
      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`drop-zone p-8 md:p-16 flex flex-col items-center gap-5 text-center ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.docx,.doc"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
                  {FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.image}
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · {fileType?.toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center animate-float">
                <Upload size={28} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-1">
                  Drag & drop your document here
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  or <span className="text-purple-400 font-semibold cursor-pointer">click to browse</span>
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {["JPG / PNG", "PDF", "Word (.docx)"].map((t) => (
                  <span key={t} className="badge bg-white/5 text-[var(--text-tertiary)] border border-white/5">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Max 20 MB</p>
            </>
          )}
        </motion.div>
      )}

      {file && !result && !loading && (
        <div className="flex justify-center mt-6">
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2 text-base px-8 py-3">
            <Sparkles size={18} /> Simplify Document
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingOrb text="AI is reading your document…" />}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Status Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge ${
                result.confidence === "high" ? "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20"
                : result.confidence === "medium" ? "bg-amber-500/12 text-amber-400 border border-amber-500/20"
                : "bg-red-500/12 text-red-400 border border-red-500/20"}`}>
                {result.confidence} confidence
              </span>
              {result.fileType && (
                <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/15">
                  {result.fileType.toUpperCase()}
                </span>
              )}
              {result.sourceRef && result.sourceRef !== "N/A" && (
                <VerifiedBadge source={result.sourceRef} />
              )}
            </div>

            {/* Side-by-Side Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original */}
              <GlassCard hover={false}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center gap-2">
                  <FileText size={14} /> Original Document
                </h3>
                <div className="glass-subtle p-4 rounded-xl max-h-80 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
                    {result.originalText}
                  </p>
                </div>
              </GlassCard>

              {/* Simplified */}
              <GlassCard hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-2">
                    <BookOpen size={14} /> Simplified Version
                  </h3>
                  <div className="flex gap-1 p-0.5 glass-subtle rounded-lg">
                    {LANG_TABS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setLangTab(t.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 border-none
                          ${langTab === t.id
                            ? "bg-purple-500/20 text-purple-300 shadow-sm"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-transparent"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="glass-subtle p-4 rounded-xl max-h-80 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {getSimplifiedText()}
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Jargon Glossary */}
            {result.jargonTerms?.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">📖 Jargon Glossary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.jargonTerms.map((j, i) => (
                    <div key={i} className="glass-subtle p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-purple-300">{j.term}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{j.meaning}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => { setFile(null); setResult(null); setPreview(null); }}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload size={16} /> Scan Another
              </button>
              <button
                onClick={() => navigate("/grievance", { state: { context: result.simplifiedText } })}
                className="btn-primary flex items-center gap-2"
              >
                Draft Grievance / RTI <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
