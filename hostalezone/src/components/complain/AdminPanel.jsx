import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import NaveBar from "./NaveBar";
import Footer from "./Footer";
import Badge from "./Badge";
import StatCard from "./StatCard";

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div
        className={`rounded-[24px] border bg-white p-4 shadow-xl ${
          isSuccess ? "border-emerald-200" : "border-rose-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
              isSuccess
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isSuccess ? <CheckCircle2 size={18} /> : <X size={18} />}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {isSuccess ? "Success" : "Error"}
            </p>
            <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getDraftFromComplaint(complaint) {
  return {
    status: complaint.status || "Pending",
    assignedTo: complaint.assignedTo || "",
    internalNotes: complaint.internalNotes || "",
  };
}

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState("");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await api.get("/complaints");
        setComplaints(res.data.data || []);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);

    return () => clearInterval(interval);
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

  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      const text = `${item.complaintId} ${item.studentName} ${item.roomNo}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const status =
        statusFilter === "All" ? true : item.status === statusFilter;

      return text && status;
    });
  }, [complaints, query, statusFilter]);

  const perPage = 8;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageSafe = Math.min(page, totalPages || 1);

  const paginated = filtered.slice(
    (pageSafe - 1) * perPage,
    pageSafe * perPage
  );

  function showToast(type, message) {
    setToast({ type, message });
  }

  function startEdit(item) {
    setEditingId(item._id);
    setDraft(getDraftFromComplaint(item));
  }

  function cancelEdit() {
    setEditingId("");
    setDraft({});
  }

  async function saveComplaint(id) {
    try {
      setSavingId(id);

      const res = await api.put(`/complaints/${id}`, draft);

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? res.data.data : c))
      );

      setEditingId("");
      setDraft({});
      showToast("success", "Complaint updated successfully");
    } catch {
      showToast("error", "Update failed");
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      <NaveBar />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <main className="complaint-shell space-y-6">
        <section className="rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/60 to-violet-100/60 px-6 py-6 shadow-[0_20px_60px_-32px_rgba(99,102,241,0.2)] lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Complaint Management
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage and assign hostel complaints with clear status tracking.
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-violet-700 shadow-sm">
              Admin overview
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-full">
            <StatCard title="Total" value={stats.total} subtitle="Live overview" />
          </div>
          <div className="h-full">
            <StatCard title="Pending" value={stats.pending} subtitle="Awaiting action" tone="pending" />
          </div>
          <div className="h-full">
            <StatCard title="In Progress" value={stats.progress} subtitle="Being resolved" tone="progress" />
          </div>
          <div className="h-full">
            <StatCard title="Resolved" value={stats.resolved} subtitle="Completed" tone="resolved" />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/95 shadow-[0_20px_60px_-34px_rgba(79,70,229,0.18)] backdrop-blur-sm">
          <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_140px]">
              <label className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  placeholder="Search complaints..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none shadow-sm"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-100/70 via-violet-50 to-fuchsia-100/60 text-xs uppercase tracking-wide text-slate-700">
                <tr>
                  <th className="px-5 py-4 text-left">ID</th>
                  <th className="px-5 py-4 text-left">Student</th>
                  <th className="px-5 py-4 text-left">Room</th>
                  <th className="px-5 py-4 text-left">Priority</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Assigned</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                      Loading complaints...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => {
                    const isEditing = editingId === item._id;

                    return (
                      <tr
                        key={item._id}
                        className="border-t border-indigo-100/70 text-slate-700 transition hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-fuchsia-50/30"
                      >
                        <td className="px-5 py-4 font-semibold text-indigo-700">
                          {item.complaintId}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <div className="font-medium text-slate-900">
                            {item.studentName}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          {item.roomNo}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <Badge>{item.priority}</Badge>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          {isEditing ? (
                            <select
                              value={draft.status}
                              onChange={(e) =>
                                setDraft({ ...draft, status: e.target.value })
                              }
                              className="min-w-[140px] rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none"
                            >
                              <option>Pending</option>
                              <option>In Progress</option>
                              <option>Resolved</option>
                            </select>
                          ) : (
                            <Badge>{item.status}</Badge>
                          )}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          {isEditing ? (
                            <input
                              value={draft.assignedTo}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  assignedTo: e.target.value,
                                })
                              }
                              className="min-w-[140px] rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none"
                              placeholder="Assign staff"
                            />
                          ) : (
                            <span className="text-slate-700">
                              {item.assignedTo || "Not Assigned"}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/complaint-details/${item._id}`}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Eye size={16} />
                            </Link>

                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveComplaint(item._id)}
                                  disabled={savingId === item._id}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                >
                                  <Save size={16} />
                                </button>

                                <button
                                  onClick={cancelEdit}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(item)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                              >
                                <Pencil size={16} />
                              </button>
                            )}

                            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 transition hover:border-rose-200 hover:bg-rose-50">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-indigo-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * perPage + 1} to{" "}
              {Math.min(pageSafe * perPage, filtered.length)} of {filtered.length} complaints
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={pageSafe === (totalPages || 1)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}