const toneMap = {
  High: "border-rose-300 bg-rose-100 text-rose-700",
  Medium: "border-amber-300 bg-amber-100 text-amber-700",
  Low: "border-slate-300 bg-slate-100 text-slate-700",
  Pending: "border-amber-300 bg-amber-100 text-amber-800",
  "In Progress": "border-violet-300 bg-violet-100 text-violet-800",
  Resolved: "border-emerald-300 bg-emerald-100 text-emerald-800",
};

export default function Badge({ children, className = "" }) {
  const value = typeof children === "string" ? children.trim() : children;
  const styles = toneMap[value] || "border-slate-300 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles} ${className}`.trim()}
    >
      {children}
    </span>
  );
}