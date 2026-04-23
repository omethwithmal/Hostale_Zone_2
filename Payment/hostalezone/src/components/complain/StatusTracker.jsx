const steps = ["Pending", "In Progress", "Resolved"];

export default function StatusTracker({ status = "Pending" }) {
  const activeIndex = Math.max(0, steps.indexOf(status));

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Live status tracker</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const active = index <= activeIndex;
          const isCurrent = step === status;

          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  active
                    ? isCurrent
                      ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white"
                      : "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step}
              </span>
              {index !== steps.length - 1 && (
                <span className={`h-1 w-8 rounded-full ${active ? "bg-blue-500" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
