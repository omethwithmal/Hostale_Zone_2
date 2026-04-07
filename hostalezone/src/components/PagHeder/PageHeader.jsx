export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-8 text-white shadow-[0_25px_90px_-35px_rgba(30,64,175,0.8)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">{eyebrow}</p> : null}
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="mt-4 text-base leading-7 text-blue-100/90">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
