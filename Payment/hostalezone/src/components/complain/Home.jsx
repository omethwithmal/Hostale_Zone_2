import {
  ArrowRight,
  BellRing,
  ClipboardCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

// CHANGED: added complaint page navbar and footer
import NaveBar from "./NaveBar";
import Footer from "./Footer";

const features = [
  {
    icon: <BellRing size={20} />,
    title: "Fast issue reporting",
    text: "Students can submit hostel maintenance complaints with clear details, location information, and image evidence through a simple reporting flow.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Smart priority handling",
    text: "Complaint priority is assigned based on issue type, helping urgent problems like water and electricity receive faster attention.",
  },
  {
    icon: <ClipboardCheck size={20} />,
    title: "Transparent status tracking",
    text: "Students and administrators can clearly follow each complaint from Pending to In Progress and finally to Resolved.",
  },
];

export default function Home() {
  return (
    <>
      {/* CHANGED: complaint navbar added */}
      <NaveBar />

      {/* CHANGED: wrapped page content with top/bottom spacing for cleaner layout */}
      <div className="w-full space-y-10 px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
        <section className="grid gap-8 overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-8 py-12 text-white shadow-[0_25px_90px_-35px_rgba(30,64,175,0.8)] lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              Smart maintenance support
            </p>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Smart complaint management for faster hostel maintenance support.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-blue-100/90 sm:text-lg">
              Easily report hostel maintenance issues, attach image evidence,
              track complaint progress in real time, and help administrators
              respond faster with smarter priority handling.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {/* CHANGED: route updated from /new to /new-complaint */}
              <Link
                to="/new-complaint"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5"
              >
                Raise Complaint
                <ArrowRight size={16} />
              </Link>

              {/* CHANGED: route updated from /dashboard to /complaint-dashboard */}
              <Link
                to="/complaint-dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-sm text-blue-100">
                    Maintenance coordination
                  </p>
                  <p className="text-2xl font-black">
                    Efficient complaint handling
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-blue-100/90">
                Submit issues quickly, monitor their status clearly, and support
                better coordination between students, wardens, and maintenance
                staff.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6 text-slate-900 shadow-xl">
                <p className="text-sm font-medium text-slate-500">
                  Complaint statuses
                </p>
                <p className="mt-2 text-3xl font-black">3</p>
                <p className="mt-2 text-sm text-slate-600">
                  Pending, In Progress, Resolved
                </p>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-xl">
                <p className="text-sm font-medium text-white/80">
                  Priority levels
                </p>
                <p className="mt-2 text-3xl font-black">Auto</p>
                <p className="mt-2 text-sm text-white/85">
                  Smart priority based on issue type
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[30px] border border-white/70 bg-white/90 p-7 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)] backdrop-blur"
            >
              <div className="inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
                {feature.icon}
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-900">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.text}
              </p>
            </div>
          ))}
        </section>
      </div>

      {/* CHANGED: complaint footer added */}
      <Footer />
    </>
  );
}