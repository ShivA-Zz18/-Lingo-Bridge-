import { motion } from "framer-motion";
import BigButton from "../components/BigButton";
import { Shield, Wifi, AudioLines, ArrowDown } from "lucide-react";

const FEATURES = [
  {
    icon: <Shield size={22} className="text-emerald-400" />,
    title: "Verified Sources",
    desc: "Every answer traced back to official government portals with trust badges",
  },
  {
    icon: <Wifi size={22} className="text-cyan-400" />,
    title: "Offline-First PWA",
    desc: "Works even with no internet — progressive web app with local caching",
  },
  {
    icon: <AudioLines size={22} className="text-pink-400" />,
    title: "Voice-First Design",
    desc: "Speak in your regional dialect — powered by Bhashini & Web Speech API",
  },
];

export default function Dashboard() {
  return (
    <div className="page-container flex flex-col items-center">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center text-center pt-6 pb-14 w-full max-w-3xl">
        {/* Animated orbital circles */}
        <div className="absolute top-0 w-72 h-72 md:w-96 md:h-96 pointer-events-none opacity-15">
          <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-spin-slow" />
          <div className="absolute inset-6 rounded-full border border-cyan-400/40 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "35s" }} />
          <div className="absolute inset-12 rounded-full border border-pink-400/30 animate-spin-slow" style={{ animationDuration: "50s" }} />
          <div className="absolute inset-[4.5rem] rounded-full border border-amber-400/20 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "60s" }} />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="relative z-10 mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 via-violet-500 to-cyan-400 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-purple-500/30 border border-white/10">
            LB
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-400 blur-2xl opacity-20 animate-glow-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-4 relative z-10 leading-tight"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Bridging the{" "}
          <span className="gradient-text">Digital Divide</span>
        </motion.h1>

        <motion.p
          className="text-[var(--text-secondary)] max-w-xl text-base md:text-lg relative z-10 leading-relaxed"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          AI-powered accessibility for every citizen. Scan documents, find government schemes,
          draft grievances, access DigiLocker — all in your language.
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          className="mt-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown size={20} className="text-[var(--text-tertiary)]" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── 5 Big Action Buttons ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 w-full max-w-5xl mb-16">
        <BigButton icon="📄" label="Document Scanner" to="/scanner" color="cyan"   delay={1} />
        <BigButton icon="🎯" label="Scheme Finder"    to="/schemes"  color="green"  delay={2} />
        <BigButton icon="🎤" label="Voice Assistant"   to="/voice"    color="pink"   delay={3} />
        <BigButton icon="🖊️" label="Grievance Draft"   to="/grievance" color="amber" delay={4} />
        <BigButton icon="🔗" label="DigiLocker"       to="/digilocker" color="purple" delay={5} />
      </div>

      {/* ── Feature Highlights ───────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            className="glass-subtle p-6 flex flex-col gap-3 group hover:border-[var(--border-active)] transition-colors duration-300"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center group-hover:border-glow transition-shadow">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{f.title}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Stats Strip ──────────────────────────────────── */}
      <motion.div
        className="mt-10 flex flex-wrap justify-center gap-6 md:gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {[
          { value: "7+", label: "Govt Schemes" },
          { value: "3", label: "Languages" },
          { value: "5", label: "Document Types" },
          { value: "PWA", label: "Offline Ready" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
            <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
