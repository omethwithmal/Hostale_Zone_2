import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  MessageSquare,
  Phone,
  UserRound
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { api } from "../../api/axios";

import NaveBar from "./NaveBar";
import Footer from "./Footer";
import Badge from "./Badge";

const apiOrigin = "http://localhost:5000";

function resolveImage(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${apiOrigin}${imageUrl}`;
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ComplaintDetails() {

  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadComplaint() {

      try {

        const res = await api.get(`/complaints/${id}`);

        setComplaint(res.data.data);

      } catch {

        setComplaint(null);

      } finally {

        setLoading(false);

      }

    }

    loadComplaint();

  }, [id]);

  const timeline = useMemo(() => {

    if (!complaint) return [];

    const history = complaint.statusHistory || [];

    return history.map((item) => ({
      status: item.status,
      time: item.time
    }));

  }, [complaint]);

  return (
    <>
      <NaveBar />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 p-6 space-y-8">

        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Complaints
        </Link>

        {loading && (
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow p-6">
            Loading complaint details...
          </div>
        )}

        {!loading && complaint && (

          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">

            {/* LEFT SIDE */}
            <section className="space-y-6">

              {/* Complaint Card */}
              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-indigo-100">

                <h1 className="text-3xl font-bold text-slate-900">
                  {complaint.title || complaint.category}
                </h1>

                <div className="flex gap-2 mt-3">
                  <Badge>{complaint.status}</Badge>
                  <Badge>{complaint.priority}</Badge>
                </div>

                <div className="mt-6">

                  <p className="font-semibold text-slate-900">
                    Description
                  </p>

                  <p className="mt-3 text-slate-600 leading-7">
                    {complaint.description}
                  </p>

                </div>

                {/* Attachment */}
                {complaint.imageUrl && (

                  <div className="mt-6">

                    <p className="font-semibold text-slate-900">
                      Attachment
                    </p>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm">

                      <img
                        src={resolveImage(complaint.imageUrl)}
                        alt="complaint"
                        className="rounded-xl w-full max-h-[320px] object-cover"
                      />

                    </div>

                  </div>

                )}

              </div>

              {/* Timeline */}

              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-indigo-100">

                <p className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Clock3 size={18} />
                  Activity Timeline
                </p>

                <div className="mt-6 space-y-4">

                  {timeline.length === 0 && (
                    <p className="text-slate-500 text-sm">
                      No updates yet
                    </p>
                  )}

                  {timeline.map((item, index) => (

                    <div key={index} className="flex gap-4 items-start">

                      <div className="w-3 h-3 mt-2 bg-indigo-500 rounded-full" />

                      <div>

                        <p className="font-semibold text-slate-900">
                          Status changed to {item.status}
                        </p>

                        <p className="text-xs text-slate-400">
                          {formatDateTime(item.time)}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* Comments */}

              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-indigo-100">

                <div className="flex items-center gap-2">
                  <MessageSquare size={18} />
                  <p className="text-xl font-semibold text-slate-900">
                    Comments
                  </p>
                </div>

                <div className="mt-4 bg-indigo-50 p-4 rounded-xl text-sm text-slate-600">
                  {complaint.internalNotes || "No comments added yet."}
                </div>

              </div>

            </section>


            {/* RIGHT SIDE */}
            <aside className="space-y-6">

              {/* Details */}

              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-indigo-100">

                <p className="text-xl font-semibold text-slate-900">
                  Complaint Details
                </p>

                <div className="mt-4 space-y-3 text-sm">

                  <div>
                    <p className="text-slate-400">Complaint ID</p>
                    <p className="font-semibold">{complaint.complaintId}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="font-semibold">{complaint.category}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="font-semibold">
                      {complaint.roomNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Submitted</p>
                    <p className="font-semibold">
                      {formatDateTime(complaint.createdAt)}
                    </p>
                  </div>

                </div>

              </div>

              {/* Assigned Technician */}

              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-indigo-100">

                <p className="text-xl font-semibold text-slate-900">
                  Assigned Technician
                </p>

                <div className="flex items-center gap-3 mt-4">

                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <UserRound size={18} />
                  </div>

                  <div>

                    <p className="font-semibold">
                      {complaint.assignedTo || "Not Assigned"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Maintenance Staff
                    </p>

                  </div>

                </div>

              </div>

              {/* Support Card */}

              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-lg">

                <p className="text-sm text-white/80">
                  Need urgent help?
                </p>

                <p className="text-lg font-semibold mt-2">
                  Contact Hostel Office
                </p>

                <button className="mt-4 bg-white text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition">
                  <Phone size={16} />
                  Call Office
                </button>

              </div>

            </aside>

          </div>

        )}

      </main>

      <Footer />
    </>
  );
}