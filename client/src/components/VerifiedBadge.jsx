import { ShieldCheck } from "lucide-react";

export default function VerifiedBadge({ source, label }) {
  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                 hover:bg-emerald-500/20 transition-colors no-underline"
    >
      <ShieldCheck size={14} />
      {label || "Verified Source"}
    </a>
  );
}
