const styles = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-rose-100 text-rose-700",
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};

export default function Badge({ children }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[children] || "bg-slate-100 text-slate-700"}`}>{children}</span>;
}
