import { useEffect, useMemo, useState } from "react";
import { Save, Search, Trash2, Wrench } from "lucide-react";
import { api } from "../../api/axios";
import Badge from "./Badge";
import PageHeader from "../PagHeder/PageHeader";
import StatCard from "./StatCard";

const apiOrigin = "http://localhost:5000";

function resolveImage(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return `${apiOrigin}${imageUrl}`;
}

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadComplaints(showLoader = false) {
      try {
        if (showLoader && mounted) setLoading(true);

        const response = await api.get("/complaints");

        if (mounted) {
          const data = response.data.data || [];
          setComplaints(data);
          setError("");

          const nextDrafts = {};
          data.forEach((item) => {
            nextDrafts[item._id] = {
              status: item.status || "Pending",
              assignedTo: item.assignedTo?.name || item.assignedTo || "",
              internalNotes: item.internalNotes || "",
            };
          });
          setDrafts(nextDrafts);
        }
      } catch (err) {
        if (mounted) {
          setComplaints([]);
          setError(err.response?.data?.message || "Unable to load live admin data currently.");
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

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((item) => item.status === "Pending").length,
      progress: complaints.filter((item) => item.status === "In Progress").length,
      resolved: complaints.filter((item) => item.status === "Resolved").length,
    }),
    [complaints]
  );

  const filtered = useMemo(
    () =>
      complaints.filter((item) =>
        [
          item.complaintId,
          item.description,
          item.category,
          item.hostelOrRoomNo,
          item.studentName,
          item.studentId,
          item.block,
          item.roomNo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [complaints, query]
  );

  function handleDraftChange(id, field, value) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function handleSave(id) {
    const draft = drafts[id];
    if (!draft) return;

    try {
      setSavingId(id);

      const response = await api.put(`/complaints/${id}`, {
        status: draft.status,
        assignedTo: draft.assignedTo,
        internalNotes: draft.internalNotes,
      });

      const updated = response.data.data;

      setComplaints((current) =>
        current.map((item) => (item._id === id ? updated : item))
      );

      setDrafts((current) => ({
        ...current,
        [id]: {
          status: updated.status || "Pending",
          assignedTo: updated.assignedTo?.name || updated.assignedTo || "",
          internalNotes: updated.internalNotes || "",
        },
      }));

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSavingId("");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints((current) => current.filter((item) => item._id !== id));
      setDrafts((current) => {
        const copy = { ...current };
        delete copy[id];
        return copy;
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  }

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        eyebrow="Admin operations"
        title="Manage hostel maintenance complaints and monitor resolution progress."
        description="Review submitted complaints, update their status, assign maintenance responsibility, and manage issue records through the admin panel."
      />

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total" value={stats.total} tone="neutral" subtitle="Live overview" />
        <StatCard title="Pending" value={stats.pending} tone="pending" subtitle="Awaiting action" />
        <StatCard title="In Progress" value={stats.progress} tone="progress" subtitle="Currently handled" />
        <StatCard title="Resolved" value={stats.resolved} tone="resolved" subtitle="Completed issues" />
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by complaint ID, student, room number, or issue details"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
            Loading admin complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
            No complaints found.
          </div>
        ) : (
          filtered.map((complaint) => {
            const locationText =
              complaint.block && complaint.roomNo
                ? `${complaint.block} - Room ${complaint.roomNo}`
                : complaint.hostelOrRoomNo || "Location not provided";

            const draft = drafts[complaint._id] || {
              status: complaint.status || "Pending",
              assignedTo: complaint.assignedTo?.name || complaint.assignedTo || "",
              internalNotes: complaint.internalNotes || "",
            };

            return (
              <article
                key={complaint._id || complaint.complaintId}
                className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)]"
              >
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                          {complaint.complaintId}
                        </p>
                        <h2 className="mt-2 text-xl font-black text-slate-900">
                          {complaint.category}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{locationText}</p>
                      </div>

                      <div className="flex gap-2">
                        <Badge>{complaint.priority}</Badge>
                        <Badge>{complaint.status}</Badge>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600">{complaint.description}</p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-bold text-slate-900">Student name</p>
                        <p>{complaint.studentName || "Not provided"}</p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-bold text-slate-900">Student ID</p>
                        <p>{complaint.studentId || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-bold text-slate-900">Block / Hostel</p>
                        <p>{complaint.block || "Not provided"}</p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p className="font-bold text-slate-900">Room No</p>
                        <p>{complaint.roomNo || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          handleDraftChange(complaint._id, "status", event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>

                      <input
                        value={draft.assignedTo}
                        onChange={(event) =>
                          handleDraftChange(complaint._id, "assignedTo", event.target.value)
                        }
                        placeholder="Assign technician"
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleDelete(complaint._id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>

                    <textarea
                      value={draft.internalNotes}
                      onChange={(event) =>
                        handleDraftChange(complaint._id, "internalNotes", event.target.value)
                      }
                      rows="3"
                      placeholder="Add internal notes"
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleSave(complaint._id)}
                      disabled={savingId === complaint._id}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save size={16} />
                      {savingId === complaint._id ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  <div className="rounded-[26px] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3">
                      <Wrench size={20} />
                    </div>

                    <h3 className="mt-4 text-xl font-black">Complaint management actions</h3>

                    <p className="mt-3 text-sm leading-7 text-blue-100/90">
                      Update complaint status, assign responsibility, and record internal notes to support effective maintenance issue handling.
                    </p>

                    <div className="mt-5">
                      {complaint.imageUrl ? (
                        <img
                          src={resolveImage(complaint.imageUrl)}
                          alt={complaint.category}
                          className="h-52 w-full rounded-[20px] object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center rounded-[20px] border border-dashed border-white/20 bg-white/10 text-sm text-blue-100/80">
                          No image attached
                        </div>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-blue-100/90">
                      Submitted:{" "}
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}