import { ArrowUpRight } from "lucide-react";

const tones = {
  neutral: "from-slate-900 via-blue-900 to-indigo-900 text-white",
  pending: "from-amber-400 to-orange-500 text-white",
  progress: "from-blue-600 to-indigo-700 text-white",
  resolved: "from-emerald-500 to-teal-600 text-white",
};

export default function StatCard({ title, value, tone = "neutral", subtitle = "Live overview" }) {
  return (
    <div className={`rounded-[28px] bg-gradient-to-br ${tones[tone]} p-6 shadow-[0_18px_60px_-24px_rgba(37,99,235,0.55)]`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
          <p className="mt-2 text-sm text-white/80">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
}
