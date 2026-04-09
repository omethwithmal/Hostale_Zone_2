import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListChecks, PlusCircle } from "lucide-react";
import { api } from "../../api/axios";
import StatCard from "./StatCard";
import ComplaintCard from "../ComplaintCard/ComplaintCard";
import PageHeader from "../PagHeder/PageHeader";

// CHANGED: added complaint page navbar and footer
import NaveBar from "./NaveBar";
import Footer from "./Footer";

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchComplaints(showLoader = false) {
      try {
        if (showLoader && mounted) setLoading(true);

        const response = await api.get("/complaints");

        if (mounted) {
          setComplaints(response.data.data || []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setComplaints([]);
          setError(
            err.response?.data?.message || "Unable to load complaint data."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchComplaints(true);

    const interval = setInterval(() => {
      fetchComplaints(false);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    const source = complaints || [];
    return {
      total: source.length,
      pending: source.filter((item) => item.status === "Pending").length,
      progress: source.filter((item) => item.status === "In Progress").length,
      resolved: source.filter((item) => item.status === "Resolved").length,
    };
  }, [complaints]);

  const latestComplaint = useMemo(() => {
    if (!complaints.length) return null;

    return [...complaints].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [complaints]);

  return (
    <>
      {/* CHANGED: complaint navbar added */}
      <NaveBar />

      {/* CHANGED: wrapped dashboard content with spacing for cleaner layout */}
      <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
        <PageHeader
          eyebrow="Student dashboard"
          title="Manage and track your hostel maintenance complaints in one place."
          description="View complaint progress, check recent updates, and quickly access reporting and follow-up actions through a clear student-friendly dashboard."
          actions={
            <>
              {/* CHANGED: route updated from /new to /new-complaint */}
              <Link
                to="/new-complaint"
                className="rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5"
              >
                <span className="inline-flex items-center gap-2">
                  <PlusCircle size={16} /> Raise new
                </span>
              </Link>

              {/* CHANGED: kept route consistent with App.jsx */}
              <Link
                to="/complaints"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur"
              >
                <span className="inline-flex items-center gap-2">
                  <ListChecks size={16} /> View all
                </span>
              </Link>
            </>
          }
        />

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total complaints"
            value={stats.total}
            tone="neutral"
            subtitle="All submitted items"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            tone="pending"
            subtitle="Waiting for admin action"
          />
          <StatCard
            title="In progress"
            value={stats.progress}
            tone="progress"
            subtitle="Currently being handled"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            tone="resolved"
            subtitle="Completed successfully"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-white/70 bg-white/90 p-7 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Quick actions
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              Stay on top of student maintenance requests.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Report new issues fast, keep image evidence ready, and monitor how
              quickly the hostel team resolves them.
            </p>
            <div className="mt-6 grid gap-3">
              {/* CHANGED: route updated from /new to /new-complaint */}
              <Link
                to="/new-complaint"
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Raise a maintenance complaint <ArrowRight size={16} />
              </Link>

              {/* CHANGED: kept route consistent with App.jsx */}
              <Link
                to="/complaints"
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Open complaint history <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-7 text-white shadow-[0_20px_70px_-35px_rgba(37,99,235,0.65)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              Complaint overview
            </p>
            <h2 className="mt-3 text-2xl font-black">
              A clear view of complaint progress and response activity.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-blue-100/90">
              <li>• Monitor complaint status from submission to resolution.</li>
              <li>• Identify pending issues that still require admin attention.</li>
              <li>
                • Keep track of updates, priorities, and maintenance response
                progress.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Latest activity
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Recent complaints
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
              Loading complaints...
            </div>
          ) : !latestComplaint ? (
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
              No complaints found yet.
            </div>
          ) : (
            <ComplaintCard complaint={latestComplaint} compact />
          )}
        </section>
      </div>

      {/* CHANGED: complaint footer added */}
      <Footer />
    </>
  );
}