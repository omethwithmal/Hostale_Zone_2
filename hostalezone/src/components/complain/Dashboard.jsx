import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CircleCheckBig,
  FileText,
  PlusCircle,
} from "lucide-react";

import { api } from "../../api/axios";
import NaveBar from "./NaveBar";
import Footer from "./Footer";
import StatCard from "./StatCard";
import Badge from "./Badge";

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

    const interval = setInterval(() => fetchComplaints(false), 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Pending").length,
      progress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    }),
    [complaints]
  );

  const recentComplaints = useMemo(() => complaints.slice(0, 5), [complaints]);

  return (
    <>
      <NaveBar />

      <main className="complaint-shell space-y-6">
        {/* Welcome Section */}
        <section className="overflow-hidden rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/70 to-violet-100/70 shadow-[0_20px_60px_-30px_rgba(99,102,241,0.22)]">
          <div className="grid gap-6 px-6 py-6 lg:min-h-[190px] lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                Welcome back, Student <span className="inline-block">👋</span>
              </p>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Track and manage your hostel maintenance complaints easily using
                the dashboard.
              </p>

              <div className="mt-5 inline-flex w-fit items-center rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 shadow-sm">
                Complaint overview
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-[0_18px_40px_-20px_rgba(124,58,237,0.7)]">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 left-0 h-24 w-24 rounded-full bg-pink-300/20 blur-2xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      Response Center
                    </p>

                    <p className="mt-3 text-2xl font-semibold leading-8">
                      Fast status visibility for every complaint.
                    </p>

                    <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
                      Monitor complaint progress and receive updates quickly.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <FileText size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm text-amber-800 shadow-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-full">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              subtitle="Live overview"
              tone="neutral"
              icon={ClipboardList}
            />
          </div>

          <div className="h-full">
            <StatCard
              title="Pending"
              value={stats.pending}
              subtitle="Awaiting action"
              tone="pending"
              icon={Clock3}
            />
          </div>

          <div className="h-full">
            <StatCard
              title="In Progress"
              value={stats.progress}
              subtitle="Being resolved"
              tone="progress"
              icon={FileText}
            />
          </div>

          <div className="h-full">
            <StatCard
              title="Resolved"
              value={stats.resolved}
              subtitle="Completed"
              tone="resolved"
              icon={CircleCheckBig}
            />
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/95 shadow-[0_20px_60px_-34px_rgba(79,70,229,0.18)] backdrop-blur-sm">
          <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 px-6 py-5">
            <p className="text-2xl font-semibold text-slate-900">
              Recent Complaints
            </p>

            <p className="mt-1 text-sm text-slate-600">
              View your latest complaint submissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-100/70 via-violet-50 to-fuchsia-100/60 text-xs uppercase tracking-wide text-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">Complaint ID</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Priority</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading complaints...
                    </td>
                  </tr>
                ) : recentComplaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No complaints submitted yet
                    </td>
                  </tr>
                ) : (
                  recentComplaints.map((item) => (
                    <tr
                      key={item._id || item.complaintId}
                      className="border-t border-indigo-100/70 transition hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-fuchsia-50/40"
                    >
                      <td className="px-6 py-4 font-semibold text-indigo-700">
                        {item.complaintId}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {item.title || item.description?.slice(0, 40)}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {item.category}
                      </td>

                      <td className="px-6 py-4">
                        <Badge>{item.priority}</Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge>{item.status}</Badge>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-[0_24px_60px_-28px_rgba(124,58,237,0.75)]">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-pink-300/20 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-semibold">
                Need to report an issue?
              </p>

              <p className="mt-2 text-sm leading-6 text-white/85">
                Submit a complaint and our maintenance team will resolve it
                quickly.
              </p>
            </div>

            <Link
              to="/new-complaint"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition duration-200 hover:scale-105 hover:bg-indigo-50"
            >
              <PlusCircle size={18} />
              Submit Complaint
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}