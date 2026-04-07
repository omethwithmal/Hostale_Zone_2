import Badge from "./Badge";
import StatusTracker from "./StatusTracker";

const apiOrigin = "http://localhost:5000";

function resolveImage(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return `${apiOrigin}${imageUrl}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default function ComplaintCard({
  complaint,
  compact = false,
  onCancel,
  cancelling = false,
}) {
  const locationText =
    complaint.block && complaint.roomNo
      ? `${complaint.block} - Room ${complaint.roomNo}`
      : complaint.hostelOrRoomNo || "Location not provided";

  const canCancel = !compact && complaint.status === "Pending" && typeof onCancel === "function";
  const history = Array.isArray(complaint.statusHistory) ? complaint.statusHistory : [];

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_80px_-32px_rgba(37,99,235,0.45)] backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                {complaint.complaintId}
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-900">
                {complaint.category} issue reported
              </h3>
              <p className="mt-1 text-sm text-slate-500">Location: {locationText}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{complaint.priority}</Badge>
              <Badge>{complaint.status}</Badge>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">{complaint.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Submitted</p>
              <p>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Assigned Technician</p>
              <p>{complaint.assignedTo?.name || complaint.assignedTo || "Not assigned yet"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Student Name</p>
              <p>{complaint.studentName || "Not provided"}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Student ID</p>
              <p>{complaint.studentId || "Not provided"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Block / Hostel</p>
              <p>{complaint.block || "Not provided"}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Room No</p>
              <p>{complaint.roomNo || "Not provided"}</p>
            </div>
          </div>

          {!compact && complaint.internalNotes ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Internal Notes</p>
              <p className="mt-1">{complaint.internalNotes}</p>
            </div>
          ) : null}

          <div className="mt-5">
            <StatusTracker status={complaint.status} />
          </div>

          {!compact ? (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-900">Complaint Status History</p>
              {history.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No status history available yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {history.map((item, index) => (
                    <div key={`${item.status}-${item.time}-${index}`} className="flex gap-3">
                      <div className="mt-1 flex flex-col items-center">
                        <span className="h-3 w-3 rounded-full bg-blue-600" />
                        {index !== history.length - 1 ? (
                          <span className="mt-1 h-8 w-px bg-blue-200" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.status}</p>
                        <p className="text-xs text-slate-500">{formatDate(item.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {canCancel ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => onCancel(complaint)}
                disabled={cancelling}
                className="inline-flex items-center rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cancelling ? "Cancelling..." : "Cancel Complaint"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 p-6 lg:border-l lg:border-t-0">
          {complaint.imageUrl ? (
            <img
              src={resolveImage(complaint.imageUrl)}
              alt={complaint.category}
              className="h-56 w-full rounded-[24px] object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-sm font-medium text-slate-400">
              No image attached
            </div>
          )}

          <div className="mt-4 rounded-[24px] bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-bold text-slate-900">Resolution Date</p>
            <p>
              {complaint.resolvedAt
                ? new Date(complaint.resolvedAt).toLocaleDateString()
                : "Not resolved yet"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
