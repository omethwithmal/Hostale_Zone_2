import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { api } from "../../api/axios";
import ComplaintCard from "../ComplaintCard/ComplaintCard";
import PageHeader from "../PagHeder/PageHeader";

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

    const interval = setInterval(() => {
      loadComplaints(false);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleCancelComplaint(complaint) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel complaint ${complaint.complaintId}?`
    );

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
      const matchQuery = [
        item.complaintId,
        item.category,
        item.description,
        item.hostelOrRoomNo,
        item.studentName,
        item.studentId,
        item.block,
        item.roomNo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchStatus = status === "All" ? true : item.status === status;
      return matchQuery && matchStatus;
    });
  }, [complaints, query, status]);

  return (
    <div className="w-full space-y-8 px-4 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        eyebrow="Complaint History"
        title="Review your submitted complaints and track their current status."
        description="Search by complaint ID, category, room, student, or keywords to quickly find complaint records and monitor their progress."
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by complaint ID, student, room or description"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        {success ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5" />
            <p className="font-medium">{success}</p>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-amber-700">{error}</p> : null}
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
            Loading complaint history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
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
    </div>
  );
}