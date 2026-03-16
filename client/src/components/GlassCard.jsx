import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = true, glow = false, ...props }) {
  return (
    <motion.div
      className={`glass p-6 ${glow ? "border-glow" : ""} ${className}`}
      whileHover={hover ? {
        y: -4,
        boxShadow: "0 12px 40px rgba(124,58,237,0.12), 0 0 60px rgba(124,58,237,0.04)",
        borderColor: "rgba(130, 80, 255, 0.25)",
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
