import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Save,
  Search,
  Trash2,
  Wrench,
  X,
  Pencil,
} from "lucide-react";
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

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-rose-200 bg-rose-50 text-rose-800"
        }`}
      >
        <div className="mt-0.5">
          {isSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold">{isSuccess ? "Success" : "Error"}</p>
          <p className="mt-1 text-sm">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 transition hover:bg-black/5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ open, complaintId, onCancel, onConfirm, deleting }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">Delete complaint?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This action will permanently remove complaint{" "}
              <span className="font-bold text-slate-900">{complaintId || "record"}</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Draft values for each complaint card
  const [drafts, setDrafts] = useState({});

  // Track cards currently being edited
  const [editingCards, setEditingCards] = useState({});

  // Save / delete states
  const [savingId, setSavingId] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  // Load complaints from backend
  useEffect(() => {
    let mounted = true;

    async function loadComplaints(showLoader = false) {
      try {
        if (showLoader && mounted) setLoading(true);

        const response = await api.get("/complaints");
        const data = response.data.data || [];

        if (!mounted) return;

        setComplaints(data);
        setError("");

        // Important fix:
        // Only refresh draft values for cards that are NOT currently being edited.
        setDrafts((currentDrafts) => {
          const nextDrafts = { ...currentDrafts };

          data.forEach((item) => {
            const id = item._id;
            const backendDraft = {
              status: item.status || "Pending",
              assignedTo: item.assignedTo?.name || item.assignedTo || "",
              internalNotes: item.internalNotes || "",
            };

            if (!editingCards[id] && savingId !== id) {
              nextDrafts[id] = backendDraft;
            }
          });

          return nextDrafts;
        });
      } catch (err) {
        if (mounted) {
          setComplaints([]);
          setError(err.response?.data?.message || "Unable to load admin complaint data.");
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
  }, [editingCards, savingId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((item) => item.status === "Pending").length,
      progress: complaints.filter((item) => item.status === "In Progress").length,
      resolved: complaints.filter((item) => item.status === "Resolved").length,
      high: complaints.filter((item) => item.priority === "High").length,
      urgentPending: complaints.filter(
        (item) => item.priority === "High" && item.status !== "Resolved"
      ).length,
    }),
    [complaints]
  );

  const urgentComplaints = useMemo(
    () =>
      complaints
        .filter((item) => item.priority === "High" && item.status !== "Resolved")
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3),
    [complaints]
  );

  const filtered = useMemo(() => {
    const filteredComplaints = complaints.filter((item) => {
      const searchText = [
        item.complaintId,
        item.description,
        item.category,
        item.hostelOrRoomNo,
        item.studentName,
        item.studentId,
        item.block,
        item.roomNo,
        item.priority,
        item.status,
        item.assignedTo?.name || item.assignedTo,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
    });

    const sortedComplaints = [...filteredComplaints];

    sortedComplaints.sort((a, b) => {
      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();
      const aUpdated = new Date(a.updatedAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || 0).getTime();

      const priorityRank = { High: 3, Medium: 2, Low: 1 };
      const statusRank = { Pending: 3, "In Progress": 2, Resolved: 1 };

      switch (sortBy) {
        case "Oldest":
          return aCreated - bCreated;
        case "High Priority":
          return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        case "Pending First":
          return (statusRank[b.status] || 0) - (statusRank[a.status] || 0);
        case "Recently Updated":
          return bUpdated - aUpdated;
        case "Newest":
        default:
          return bCreated - aCreated;
      }
    });

    return sortedComplaints;
  }, [complaints, query, statusFilter, priorityFilter, categoryFilter, sortBy]);

  function showToast(type, message) {
    setToast({ type, message });
  }

  function getDefaultDraft(complaint) {
    return {
      status: complaint.status || "Pending",
      assignedTo: complaint.assignedTo?.name || complaint.assignedTo || "",
      internalNotes: complaint.internalNotes || "",
    };
  }

  // Open edit mode for one card
  function handleEditStart(complaint) {
    setDrafts((current) => ({
      ...current,
      [complaint._id]: current[complaint._id] || getDefaultDraft(complaint),
    }));

    setEditingCards((current) => ({
      ...current,
      [complaint._id]: true,
    }));
  }

  // Cancel edit and reload original complaint values into the draft
  function handleEditCancel(complaint) {
    setDrafts((current) => ({
      ...current,
      [complaint._id]: getDefaultDraft(complaint),
    }));

    setEditingCards((current) => ({
      ...current,
      [complaint._id]: false,
    }));
  }

  // Update draft while typing
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

      const updatedComplaint = response.data.data;

      // Update admin list immediately
      setComplaints((current) =>
        current.map((item) => (item._id === id ? updatedComplaint : item))
      );

      // Replace draft with latest backend data
      setDrafts((current) => ({
        ...current,
        [id]: {
          status: updatedComplaint.status || "Pending",
          assignedTo: updatedComplaint.assignedTo?.name || updatedComplaint.assignedTo || "",
          internalNotes: updatedComplaint.internalNotes || "",
        },
      }));

      // Leave edit mode
      setEditingCards((current) => ({
        ...current,
        [id]: false,
      }));

      showToast(
        "success",
        "Complaint updated successfully."
      );
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update complaint.";
      setError(message);
      showToast("error", message);
    } finally {
      setSavingId("");
    }
  }

  function openDeleteModal(complaint) {
    setDeleteTarget(complaint);
  }

  function closeDeleteModal() {
    if (deletingId) return;
    setDeleteTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?._id) return;

    try {
      setDeletingId(deleteTarget._id);
      await api.delete(`/complaints/${deleteTarget._id}`);

      setComplaints((current) => current.filter((item) => item._id !== deleteTarget._id));

      setDrafts((current) => {
        const copy = { ...current };
        delete copy[deleteTarget._id];
        return copy;
      });

      setEditingCards((current) => {
        const copy = { ...current };
        delete copy[deleteTarget._id];
        return copy;
      });

      showToast("success", "Complaint deleted successfully.");
      setDeleteTarget(null);
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || "Delete failed.";
      setError(message);
      showToast("error", message);
    } finally {
      setDeletingId("");
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setSortBy("Newest");
  }

  return (
    <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        complaintId={deleteTarget?.complaintId}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        deleting={deletingId === deleteTarget?._id}
      />

      <PageHeader
        eyebrow="Admin operations"
        title="Manage hostel maintenance complaints and monitor resolution progress."
        description="Review submitted complaints, update status, assign technicians, and save internal notes."
      />

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} tone="neutral" subtitle="Live overview" />
        <StatCard title="Pending" value={stats.pending} tone="pending" subtitle="Awaiting action" />
        <StatCard title="In Progress" value={stats.progress} tone="progress" subtitle="Currently handled" />
        <StatCard title="Resolved" value={stats.resolved} tone="resolved" subtitle="Completed issues" />
        <StatCard title="High Priority" value={stats.high} tone="alert" subtitle="Urgent attention" />
      </section>

      <section className="rounded-[30px] border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-6 shadow-[0_20px_70px_-35px_rgba(244,63,94,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
              Urgent complaints highlight
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {stats.urgentPending} high-priority complaint{stats.urgentPending === 1 ? "" : "s"} need attention
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              These issues are marked high priority and are not resolved yet.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-sm">
            <Clock3 size={16} />
            Immediate review recommended
          </div>
        </div>

        {urgentComplaints.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {urgentComplaints.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600">
                      {item.complaintId}
                    </p>
                    <h3 className="mt-1 text-base font-black text-slate-900">{item.category}</h3>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.description}</p>

                <div className="mt-4 text-xs text-slate-500">
                  Updated: {formatDateTime(item.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-rose-200 bg-white/70 p-4 text-sm text-slate-600">
            No urgent high-priority complaints right now.
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)]">
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:col-span-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by complaint ID, student, room number, or issue details"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option value="Newest">Sort: Newest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Recently Updated">Sort: Recently Updated</option>
            <option value="High Priority">Sort: High Priority</option>
            <option value="Pending First">Sort: Pending First</option>
          </select>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            <option value="All">All Category</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="WiFi">WiFi</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
          >
            Clear Filters
          </button>
        </div>
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
            Loading admin complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-8 text-sm text-slate-500">
            No complaints found for the selected search or filters.
          </div>
        ) : (
          filtered.map((complaint) => {
            const locationText =
              complaint.block && complaint.roomNo
                ? `${complaint.block} - Room ${complaint.roomNo}`
                : complaint.hostelOrRoomNo || "Location not provided";

            const isEditing = !!editingCards[complaint._id];

            const draft = drafts[complaint._id] || getDefaultDraft(complaint);

            const isUrgent = complaint.priority === "High" && complaint.status !== "Resolved";

            return (
              <article
                key={complaint._id || complaint.complaintId}
                className={`rounded-[30px] border bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)] ${
                  isUrgent ? "border-rose-200 ring-2 ring-rose-100" : "border-white/70"
                }`}
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

                      <div className="flex flex-wrap gap-2">
                        {isUrgent ? <Badge>Urgent</Badge> : null}
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

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
                        <p className="font-bold text-slate-900">Submitted</p>
                        <p>{formatDateTime(complaint.createdAt)}</p>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700">
                        <p className="font-bold text-slate-900">Last updated</p>
                        <p>{formatDateTime(complaint.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => handleEditStart(complaint)}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSave(complaint._id)}
                            disabled={savingId === complaint._id}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Save size={16} />
                            {savingId === complaint._id ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditCancel(complaint)}
                            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <select
                        value={draft.status}
                        disabled={!isEditing}
                        onChange={(event) =>
                          handleDraftChange(complaint._id, "status", event.target.value)
                        }
                        className={`rounded-2xl border px-4 py-3 text-sm outline-none ${
                          isEditing
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-100 bg-slate-100 text-slate-500"
                        }`}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>

                      <input
                        value={draft.assignedTo}
                        disabled={!isEditing}
                        onChange={(event) =>
                          handleDraftChange(complaint._id, "assignedTo", event.target.value)
                        }
                        placeholder="Assign technician"
                        className={`rounded-2xl border px-4 py-3 text-sm outline-none ${
                          isEditing
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-100 bg-slate-100 text-slate-500"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => openDeleteModal(complaint)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>

                    <textarea
                      value={draft.internalNotes}
                      disabled={!isEditing}
                      onChange={(event) =>
                        handleDraftChange(complaint._id, "internalNotes", event.target.value)
                      }
                      rows="3"
                      placeholder="Add internal notes"
                      className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                        isEditing
                          ? "border-slate-200 bg-slate-50"
                          : "border-slate-100 bg-slate-100 text-slate-500"
                      }`}
                    />
                  </div>

                  <div className="rounded-[26px] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3">
                      <Wrench size={20} />
                    </div>

                    <h3 className="mt-4 text-xl font-black">Complaint management actions</h3>

                    <p className="mt-3 text-sm leading-7 text-blue-100/90">
                      Update complaint status, assign responsibility, and record internal notes to support effective issue handling.
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

                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl bg-white/10 p-4 text-sm text-blue-100/90">
                        Submitted: {formatDateTime(complaint.createdAt)}
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 text-sm text-blue-100/90">
                        Last updated: {formatDateTime(complaint.updatedAt)}
                      </div>
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