const steps = ["Pending", "In Progress", "Resolved"];

export default function StatusTracker({ status = "Pending" }) {
  const activeIndex = Math.max(0, steps.indexOf(status));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Activity timeline</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const completed = index <= activeIndex;
          const current = step === status;
          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`inline-flex min-w-[94px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  current
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                    : completed
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {step}
              </span>
              {index !== steps.length - 1 ? (
                <span className={`h-1 w-7 rounded-full ${completed ? "bg-indigo-300" : "bg-slate-200"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
