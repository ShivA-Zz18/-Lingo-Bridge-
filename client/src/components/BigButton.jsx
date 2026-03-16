import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function BigButton({ icon, label, to, color = "purple", delay = 0 }) {
  const navigate = useNavigate();

  const colorMap = {
    purple: { border: "rgba(168,85,247,0.2)", glow: "rgba(168,85,247,0.12)", active: "rgba(168,85,247,0.25)", text: "#a855f7", shadow: "rgba(168,85,247,0.15)" },
    cyan:   { border: "rgba(34,211,238,0.2)",  glow: "rgba(34,211,238,0.12)",  active: "rgba(34,211,238,0.25)",  text: "#22d3ee", shadow: "rgba(34,211,238,0.15)" },
    pink:   { border: "rgba(244,114,182,0.2)", glow: "rgba(244,114,182,0.12)", active: "rgba(244,114,182,0.25)", text: "#f472b6", shadow: "rgba(244,114,182,0.15)" },
    green:  { border: "rgba(52,211,153,0.2)",  glow: "rgba(52,211,153,0.12)",  active: "rgba(52,211,153,0.25)",  text: "#34d399", shadow: "rgba(52,211,153,0.15)" },
    amber:  { border: "rgba(251,191,36,0.2)",  glow: "rgba(251,191,36,0.12)",  active: "rgba(251,191,36,0.25)",  text: "#fbbf24", shadow: "rgba(251,191,36,0.15)" },
  };

  const c = colorMap[color] || colorMap.purple;

  return (
    <motion.button
      id={`btn-${label.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={() => navigate(to)}
      className="glass flex flex-col items-center justify-center gap-3 p-6 cursor-pointer w-full aspect-square relative overflow-hidden group"
      style={{ borderColor: c.border }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 35px ${c.glow}, 0 10px 40px ${c.shadow}, inset 0 0 25px ${c.glow}`,
        borderColor: c.text,
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${c.glow} 0%, transparent 70%)` }}
      />
      <span className="text-4xl relative z-10 drop-shadow-lg">{icon}</span>
      <span className="text-xs font-bold tracking-wide uppercase relative z-10 transition-colors duration-300" style={{ color: c.text }}>
        {label}
      </span>
    </motion.button>
  );
}
