import { ArrowUpRight } from "lucide-react";

const tones = {
  neutral: "from-blue-100 via-indigo-50 to-violet-100 text-slate-900",
  pending: "from-amber-100 via-orange-50 to-yellow-100 text-slate-900",
  progress: "from-indigo-100 via-violet-50 to-fuchsia-100 text-slate-900",
  resolved: "from-emerald-100 via-teal-50 to-cyan-100 text-slate-900",
  alert: "from-rose-100 via-pink-50 to-orange-100 text-slate-900",
};

const iconTones = {
  neutral: "bg-blue-600 text-white",
  pending: "bg-amber-500 text-white",
  progress: "bg-violet-600 text-white",
  resolved: "bg-emerald-500 text-white",
  alert: "bg-rose-600 text-white",
};

export default function StatCard({ title, value, tone = "neutral", subtitle = "Live overview", icon: Icon }) {
  return (
    <div className={`surface-card bg-gradient-to-br ${tones[tone] || tones.neutral} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${iconTones[tone] || iconTones.neutral}`}>
          {Icon ? <Icon size={20} /> : <ArrowUpRight size={18} />}
        </div>
      </div>
    </div>
  );
}