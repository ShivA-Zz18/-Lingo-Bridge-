import { motion } from "framer-motion";

export default function LoadingOrb({ text = "Processing…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-20 h-20">
        {/* Core orb */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: "radial-gradient(circle, #a855f7 0%, #7c3aed 60%, transparent 100%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Ring 1 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        {/* Ring 2 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
          animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <p className="text-sm text-[var(--text-secondary)] animate-pulse">{text}</p>
    </div>
  );
}
