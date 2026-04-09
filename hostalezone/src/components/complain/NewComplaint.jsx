import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImagePlus,
  Phone,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { api } from "../../api/axios";
import Badge from "./Badge";
import PageHeader from "../PagHeder/PageHeader";

// CHANGED: added complaint page navbar and footer
import NaveBar from "./NaveBar";
import Footer from "./Footer";

const initialForm = {
  studentName: "",
  studentId: "",
  category: "",
  block: "",
  roomNo: "",
  description: "",
  image: null,
};

const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxImageSize = 3 * 1024 * 1024;

const priorityMap = {
  Water: "High",
  Electricity: "High",
  WiFi: "Medium",
  Other: "Low",
};

const englishLettersAndSpacesRegex = /^[A-Za-z\s]+$/;
const roomNumberRegex = /^[0-9]+$/;
const studentIdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/;

function NotificationPopup({ open, type, message, onClose }) {
  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div
        className={`rounded-3xl border p-4 shadow-2xl ${
          isSuccess ? "border-green-200 bg-white" : "border-rose-200 bg-white"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-2xl p-2 ${
              isSuccess
                ? "bg-green-100 text-green-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          </div>

          <div className="flex-1">
            <h3
              className={`text-sm font-black ${
                isSuccess ? "text-green-700" : "text-rose-700"
              }`}
            >
              {isSuccess ? "Complaint Submitted" : "Submission Failed"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-4 py-2 text-sm font-bold text-white ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RightInfoPanel({ form }) {
  const totalFields = 6;
  let completedFields = 0;

  if (form.studentName.trim()) completedFields += 1;
  if (form.studentId.trim()) completedFields += 1;
  if (form.category.trim()) completedFields += 1;
  if (form.block.trim()) completedFields += 1;
  if (form.roomNo.trim()) completedFields += 1;
  if (form.description.trim()) completedFields += 1;

  const progress = Math.round((completedFields / totalFields) * 100);

  return (
    <aside className="space-y-5">
      <div className="rounded-[28px] bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white shadow-[0_20px_60px_-30px_rgba(37,99,235,0.9)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">Form Progress</h3>
            <p className="mt-1 text-sm text-blue-100">
              Track the complaint form completion level.
            </p>
          </div>
          <div className="rounded-full bg-white/20 px-3 py-2 text-sm font-black">
            {progress}%
          </div>
        </div>

        <div className="mt-5 h-2 w-full rounded-full bg-white/20">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-blue-100">
          Fill all required fields to complete the complaint submission.
        </p>
      </div>

      <div className="rounded-[28px] bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 p-5 text-white shadow-[0_20px_60px_-30px_rgba(219,39,119,0.8)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black">Smart Priority</h3>
            <p className="text-sm text-pink-100">
              Automatic category-based priority
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-pink-50">
          <li>• Water & Electricity → High</li>
          <li>• WiFi Issues → Medium</li>
          <li>• Other → Low</li>
        </ul>
      </div>

      <div className="rounded-[28px] bg-gradient-to-r from-emerald-600 to-green-500 p-5 text-white shadow-[0_20px_60px_-30px_rgba(16,185,129,0.85)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <ImagePlus size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black">Image Upload Guide</h3>
            <p className="text-sm text-indigo-100">
              Add image evidence if the issue is visible.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-indigo-50">
          Upload a clear image of the complaint if available. Supported formats
          are JPG, JPEG, PNG, and WEBP, with a maximum size of 3MB.
        </p>
      </div>

      <div className="rounded-[28px] bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white shadow-[0_20px_60px_-30px_rgba(244,63,94,0.8)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <Phone size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black">Emergency Contact</h3>
            <p className="text-sm text-rose-100">
              For urgent maintenance assistance
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-rose-50">
          Use this support contact for urgent hostel maintenance issues that
          require immediate attention.
        </p>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
        >
          Call: +94 11 234 5678
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[22px] bg-white p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-3xl font-black text-blue-600">24/7</p>
          <p className="mt-1 text-xs text-slate-500">Support Available</p>
        </div>

        <div className="rounded-[22px] bg-white p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-3xl font-black text-emerald-600">&lt;2h</p>
          <p className="mt-1 text-xs text-slate-500">Avg Response</p>
        </div>
      </div>
    </aside>
  );
}

export default function NewComplaint() {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const descriptionLength = form.description.length;

  const priority = useMemo(() => {
    return priorityMap[form.category] || "Not Assigned Yet";
  }, [form.category]);

  function showPopup(type, text) {
    setPopupType(type);
    setPopupMessage(text);
    setPopupOpen(true);
  }

  function closePopup() {
    setPopupOpen(false);
  }

  function validateSingleField(field, value) {
    const trimmedValue = String(value || "").trim();

    if (field === "studentName") {
      if (!trimmedValue) {
        return "Student name is required.";
      }
      if (trimmedValue.length < 5 || trimmedValue.length > 20) {
        return "Student name must be between 5 and 20 characters.";
      }
      if (!englishLettersAndSpacesRegex.test(trimmedValue)) {
        return "Student name must contain English letters and spaces only.";
      }
      return "";
    }

    if (field === "studentId") {
      if (!trimmedValue) {
        return "Student ID is required.";
      }
      if (trimmedValue.length < 3 || trimmedValue.length > 20) {
        return "Student ID must be between 3 and 20 characters.";
      }
      if (!studentIdRegex.test(trimmedValue)) {
        return "Student ID must include both English letters and numbers. Example: IT20234567";
      }
      return "";
    }

    if (field === "block") {
      if (!trimmedValue) {
        return "Block or hostel name is required.";
      }
      if (trimmedValue.length < 2 || trimmedValue.length > 50) {
        return "Block or hostel name must be between 2 and 50 characters.";
      }
      if (!englishLettersAndSpacesRegex.test(trimmedValue)) {
        return "Block or hostel name must contain English letters and spaces only.";
      }
      return "";
    }

    if (field === "roomNo") {
      if (!trimmedValue) {
        return "Room number is required.";
      }
      if (trimmedValue.length < 1 || trimmedValue.length > 20) {
        return "Room number must be between 1 and 20 digits.";
      }
      if (!roomNumberRegex.test(trimmedValue)) {
        return "Room number must contain numbers only.";
      }
      return "";
    }

    if (field === "description") {
      if (!trimmedValue) {
        return "Please enter a complaint description.";
      }
      if (trimmedValue.length < 15) {
        return "Description must be at least 15 characters long.";
      }
      if (trimmedValue.length > 500) {
        return "Description must not exceed 500 characters.";
      }
      return "";
    }

    if (field === "category") {
      if (!trimmedValue) {
        return "Please select a complaint category.";
      }
      return "";
    }

    return "";
  }

  function validateForm() {
    const nextErrors = {};

    const studentNameError = validateSingleField("studentName", form.studentName);
    const studentIdError = validateSingleField("studentId", form.studentId);
    const categoryError = validateSingleField("category", form.category);
    const blockError = validateSingleField("block", form.block);
    const roomNoError = validateSingleField("roomNo", form.roomNo);
    const descriptionError = validateSingleField("description", form.description);

    if (studentNameError) nextErrors.studentName = studentNameError;
    if (studentIdError) nextErrors.studentId = studentIdError;
    if (categoryError) nextErrors.category = categoryError;
    if (blockError) nextErrors.block = blockError;
    if (roomNoError) nextErrors.roomNo = roomNoError;
    if (descriptionError) nextErrors.description = descriptionError;

    if (form.image) {
      if (!allowedTypes.includes(form.image.type)) {
        nextErrors.image = "Only JPG, JPEG, PNG, and WEBP images are allowed.";
      } else if (form.image.size > maxImageSize) {
        nextErrors.image = "Image size must be less than 3MB.";
      }
    }

    return nextErrors;
  }

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    const fieldError = validateSingleField(field, value);

    setErrors((current) => ({
      ...current,
      [field]: fieldError,
    }));

    setMessage("");
    setMessageType("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    setMessage("");
    setMessageType("");

    if (!file) {
      setForm((current) => ({ ...current, image: null }));
      setPreview("");
      setErrors((current) => ({ ...current, image: "" }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setForm((current) => ({ ...current, image: null }));
      setPreview("");
      setErrors((current) => ({
        ...current,
        image: "Only JPG, JPEG, PNG, and WEBP images are allowed.",
      }));
      return;
    }

    if (file.size > maxImageSize) {
      setForm((current) => ({ ...current, image: null }));
      setPreview("");
      setErrors((current) => ({
        ...current,
        image: "Image size must be less than 3MB.",
      }));
      return;
    }

    setForm((current) => ({ ...current, image: file }));
    setPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, image: "" }));
  }

  function fillDummyData() {
    setForm({
      studentName: "Nimal Perera",
      studentId: "IT20234567",
      category: "Water",
      block: "Girls A",
      roomNo: "204",
      description:
        "Water leakage is coming from the bathroom pipe and the floor stays wet.",
      image: null,
    });

    setErrors({});
    setMessage("");
    setMessageType("");
    setPreview("");
  }

  function resetForm() {
    setForm(initialForm);
    setPreview("");
    setErrors({});
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("studentName", form.studentName.trim());
      payload.append("studentId", form.studentId.trim());
      payload.append("category", form.category);
      payload.append("block", form.block.trim());
      payload.append("roomNo", form.roomNo.trim());
      payload.append("description", form.description.trim());
      payload.append(
        "hostelOrRoomNo",
        `${form.block.trim()} - Room ${form.roomNo.trim()}`
      );

      if (form.image) {
        payload.append("image", form.image);
      }

      const response = await api.post("/complaints", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const complaintId = response?.data?.data?.complaintId;

      const successMessage = complaintId
        ? `Complaint submitted successfully. Complaint ID: ${complaintId}`
        : response.data.message || "Complaint submitted successfully.";

      setMessage(successMessage);
      setMessageType("success");
      showPopup("success", successMessage);

      setForm(initialForm);
      setPreview("");
      setErrors({});
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Could not submit complaint right now.";

      setMessage(errorMessage);
      setMessageType("error");
      showPopup("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* CHANGED: complaint navbar added */}
      <NaveBar />

      <NotificationPopup
        open={popupOpen}
        type={popupType}
        message={popupMessage}
        onClose={closePopup}
      />

      {/* CHANGED: wrapped page content with spacing for cleaner layout */}
      <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
        <PageHeader
          eyebrow="Raise Complaint"
          title="Submit a hostel maintenance complaint quickly and clearly."
          description="Provide student details, issue category, location, clear description, and image evidence so the hostel administration or maintenance team can respond more efficiently."
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-white/70 bg-white/90 p-7 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.4)] sm:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Student Details
                </h2>
                <p className="text-sm text-slate-500">
                  Provide the student information related to this complaint.
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fillDummyData}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                <Sparkles size={16} />
                Use Dummy Data
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCcw size={16} />
                Reset Form
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Student Name
                </label>
                <input
                  value={form.studentName}
                  onChange={(event) =>
                    handleChange("studentName", event.target.value)
                  }
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    errors.studentName
                      ? "border border-rose-400 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  }`}
                  placeholder="Enter student name"
                  maxLength={20}
                />
                {errors.studentName ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.studentName}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Use 5 to 20 English letters and spaces only. Example: Nimal
                    Perera
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Student ID
                </label>
                <input
                  value={form.studentId}
                  onChange={(event) =>
                    handleChange("studentId", event.target.value)
                  }
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    errors.studentId
                      ? "border border-rose-400 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  }`}
                  placeholder="Example: IT20234567"
                  maxLength={20}
                />
                {errors.studentId ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.studentId}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Must include both English letters and numbers. Example:
                    IT20234567
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6 mt-8">
              <h2 className="text-lg font-black text-slate-900">
                Complaint Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Provide the issue type, location, and a clear explanation.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Complaint Category
                </label>
                <select
                  value={form.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    errors.category
                      ? "border border-rose-400 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                  <option value="WiFi">WiFi</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.category}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Priority Level
                </label>
                <div className="mt-2 flex min-h-[50px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Badge>{priority}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Block / Hostel
                </label>
                <input
                  value={form.block}
                  onChange={(event) => handleChange("block", event.target.value)}
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    errors.block
                      ? "border border-rose-400 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  }`}
                  placeholder="Example: Girls A"
                  maxLength={50}
                />
                {errors.block ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.block}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Use English letters and spaces only. Example: Girls A
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Room No
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.roomNo}
                  onChange={(event) => handleChange("roomNo", event.target.value)}
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                    errors.roomNo
                      ? "border border-rose-400 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  }`}
                  placeholder="Example: 204"
                  maxLength={20}
                />
                {errors.roomNo ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.roomNo}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Numbers only. Example: 204
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">
                  Complaint Description
                </label>
                <span
                  className={`text-xs font-medium ${
                    descriptionLength > 500 ? "text-rose-600" : "text-slate-500"
                  }`}
                >
                  {descriptionLength}/500
                </span>
              </div>

              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows="6"
                maxLength={500}
                className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${
                  errors.description
                    ? "border border-rose-400 bg-rose-50"
                    : "border border-slate-200 bg-slate-50"
                }`}
                placeholder="Describe the issue clearly so the maintenance team can understand the problem."
              />
              {errors.description ? (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {errors.description}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Minimum 15 characters required.
                </p>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-bold text-slate-700">
                Upload Image
              </label>

              <label
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed px-6 py-10 text-center transition ${
                  errors.image
                    ? "border-rose-300 bg-rose-50"
                    : "border-blue-200 bg-blue-50/60 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
                  <ImagePlus size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to upload complaint evidence
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, JPEG, or WEBP. Max size 3MB.
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {errors.image ? (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {errors.image}
                </p>
              ) : null}

              {preview ? (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-56 w-full rounded-[24px] object-cover"
                  />
                </div>
              ) : null}
            </div>

            {message ? (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>

          <RightInfoPanel form={form} />
        </div>
      </div>

      {/* CHANGED: complaint footer added */}
      <Footer />
    </>
  );
}