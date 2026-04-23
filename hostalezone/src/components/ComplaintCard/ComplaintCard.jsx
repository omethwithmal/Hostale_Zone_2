import { Eye, MessageSquare, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../complain/Badge";

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(value) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  const diff = Date.now() - date.getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ComplaintCard({ complaint, onCancel, cancelling = false }) {
  const assignedTo = complaint.assignedTo?.name || complaint.assignedTo || "Not Assigned";
  const commentCount = Array.isArray(complaint.comments) ? complaint.comments.length : 0;

  return (
    <article className="surface-card overflow-hidden bg-gradient-to-br from-white to-violet-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold text-slate-900">
              {complaint.title || complaint.description?.slice(0, 36) || complaint.category || "Complaint"}
            </h3>
            <Badge>{complaint.status}</Badge>
            <Badge>{complaint.priority}</Badge>
          </div>
          <p className="max-w-4xl text-sm leading-7 text-slate-600">
            {complaint.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-b border-violet-100 pb-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Complaint ID</p>
          <p className="mt-1 font-semibold text-slate-900">{complaint.complaintId || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</p>
          <p className="mt-1 font-semibold text-slate-900">{complaint.category || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned To</p>
          <p className="mt-1 font-semibold text-slate-900">{assignedTo}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Update</p>
          <p className="mt-1 font-semibold text-slate-900">{formatRelative(complaint.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
        <p className="text-slate-600">Submitted on {formatDate(complaint.createdAt)}</p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-3 py-2 text-slate-700">
            <MessageSquare size={15} />
            Comments {commentCount > 0 ? `(${commentCount})` : ""}
          </div>

          {complaint.imageUrl ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-slate-700">
              <Paperclip size={15} /> Attachment
            </div>
          ) : null}

          <Link to={`/complaint-details/${complaint._id}`} className="primary-button px-4 py-2.5 text-sm">
            <Eye size={15} />
            View Details
          </Link>

          {complaint.status === "Pending" && typeof onCancel === "function" ? (
            <button
              type="button"
              onClick={() => onCancel(complaint)}
              disabled={cancelling}
              className="secondary-button px-4 py-2.5 text-sm text-rose-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}