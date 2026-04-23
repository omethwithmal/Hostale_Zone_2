import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../../api/axios";
import ComplaintCard from "../ComplaintCard/ComplaintCard";
import NaveBar from "./NaveBar";
import Footer from "./Footer";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadComplaints(showLoader = false) {
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
          setError(err.response?.data?.message || "Unable to load complaint data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadComplaints(true);
    const interval = setInterval(() => loadComplaints(false), 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleCancelComplaint(complaint) {
    const confirmed = window.confirm(`Are you sure you want to cancel complaint ${complaint.complaintId}?`);
    if (!confirmed) return;

    try {
      setCancellingId(complaint._id);
      setSuccess("");
      await api.delete(`/complaints/${complaint._id}/cancel`);
      setComplaints((current) => current.filter((item) => item._id !== complaint._id));
      setError("");
      setSuccess(`Complaint ${complaint.complaintId} was cancelled successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel complaint.");
      setSuccess("");
    } finally {
      setCancellingId("");
    }
  }

  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      const haystack = [
        item.complaintId,
        item.title,
        item.category,
        item.description,
        item.hostelOrRoomNo,
        item.studentName,
        item.studentId,
        item.block,
        item.roomNo,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = status === "All" ? true : item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [complaints, query, status]);

  return (
    <>
      <NaveBar />
      <main className="complaint-shell space-y-8">

        <section>
          <h1 className="text-3xl font-semibold text-slate-900">Complaint History</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review your submitted complaints and track their current status.
          </p>
        </section>

        <section className="surface-card p-4 sm:p-5">

          <div className="grid gap-3 lg:grid-cols-[1fr_180px]">

            <label className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 shadow-sm">
              <Search size={18} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by complaint ID, title, or description..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 shadow-sm">
              <SlidersHorizontal size={16} className="text-slate-500" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

          </div>

          {success ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="mt-0.5" />
              <p className="font-medium">{success}</p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-amber-800">{error}</p>
          ) : null}

        </section>

        <section className="space-y-5">

          {loading ? (
            <div className="surface-card bg-gradient-to-br from-white to-violet-50 p-8 text-sm text-slate-600">
              Loading complaint history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card bg-gradient-to-br from-white to-violet-50 p-8 text-sm text-slate-600">
              No complaints match your filters.
            </div>
          ) : (
            filtered.map((complaint) => (
              <ComplaintCard
                key={complaint._id || complaint.complaintId}
                complaint={complaint}
                onCancel={handleCancelComplaint}
                cancelling={cancellingId === complaint._id}
              />
            ))
          )}

        </section>

      </main>
      <Footer />
    </>
  );
}