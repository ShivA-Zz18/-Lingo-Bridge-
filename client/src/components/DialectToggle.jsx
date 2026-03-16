import { useState } from "react";
import { Languages } from "lucide-react";

const DIALECTS = [
  { id: "standard-kannada", label: "ಕನ್ನಡ (Standard)" },
  { id: "north-karnataka", label: "ಉತ್ತರ ಕರ್ನಾಟಕ" },
  { id: "coastal", label: "ಕರಾವಳಿ" },
  { id: "standard-hindi", label: "हिन्दी (Standard)" },
  { id: "bhojpuri", label: "भोजपुरी" },
];

export default function DialectToggle({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        id="dialect-toggle"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium
                   hover:border-[var(--neon-cyan)] transition-colors cursor-pointer"
      >
        <Languages size={16} className="text-cyan-400" />
        <span>{DIALECTS.find((d) => d.id === value)?.label || "Select Dialect"}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 glass rounded-lg py-1 z-50 min-w-[200px] shadow-xl">
          {DIALECTS.map((d) => (
            <button
              key={d.id}
              onClick={() => { onChange(d.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${value === d.id
                  ? "bg-purple-500/15 text-purple-300"
                  : "hover:bg-white/5 text-[var(--text-secondary)]"
                }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
