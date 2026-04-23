import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCcw, Send, Upload, X, Sparkles } from "lucide-react";
import { api } from "../../api/axios";
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
const priorityMap = { Water: "High", Electricity: "High", WiFi: "Medium", Other: "Low" };
const englishLettersAndSpacesRegex = /^[A-Za-z\s]+$/;
const roomNumberRegex = /^[0-9]+$/;
const studentIdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/;

function Popup({ open, type, message, onClose }) {
  if (!open) return null;
  const success = type === "success";

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div className={`rounded-[24px] border bg-white p-4 shadow-2xl ${success ? "border-emerald-200" : "border-rose-200"}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{success ? "Complaint Submitted" : "Submission Failed"}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function validateSingleField(field, value) {
  const trimmedValue = String(value || "").trim();

  if (field === "studentName") {
    if (!trimmedValue) return "Student name is required.";
    if (trimmedValue.length < 5 || trimmedValue.length > 20) return "Student name must be between 5 and 20 characters.";
    if (!englishLettersAndSpacesRegex.test(trimmedValue)) return "Student name must contain English letters and spaces only.";
    return "";
  }

  if (field === "studentId") {
    if (!trimmedValue) return "Student ID is required.";
    if (trimmedValue.length < 3 || trimmedValue.length > 20) return "Student ID must be between 3 and 20 characters.";
    if (!studentIdRegex.test(trimmedValue)) return "Student ID must include both English letters and numbers. Example: IT20234567";
    return "";
  }

  if (field === "category") return trimmedValue ? "" : "Please select a complaint category.";

  if (field === "block") {
    if (!trimmedValue) return "Block or hostel name is required.";
    if (trimmedValue.length < 2 || trimmedValue.length > 50) return "Block or hostel name must be between 2 and 50 characters.";
    if (!englishLettersAndSpacesRegex.test(trimmedValue)) return "Block or hostel name must contain English letters and spaces only.";
    return "";
  }

  if (field === "roomNo") {
    if (!trimmedValue) return "Room number is required.";
    if (trimmedValue.length < 1 || trimmedValue.length > 20) return "Room number must be between 1 and 20 digits.";
    if (!roomNumberRegex.test(trimmedValue)) return "Room number must contain numbers only.";
    return "";
  }

  if (field === "description") {
    if (!trimmedValue) return "Please enter a complaint description.";
    if (trimmedValue.length < 15) return "Description must be at least 15 characters long.";
    if (trimmedValue.length > 500) return "Description must not exceed 500 characters.";
    return "";
  }

  return "";
}

export default function NewComplaint() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [popupMessage, setPopupMessage] = useState("");

  const priority = useMemo(() => priorityMap[form.category] || "Select category first", [form.category]);

  function showPopup(type, message) {
    setPopupType(type);
    setPopupMessage(message);
    setPopupOpen(true);
  }

  function closePopup() {
    setPopupOpen(false);
  }

  function validateForm() {
    const nextErrors = {};
    ["studentName", "studentId", "category", "block", "roomNo", "description"].forEach((field) => {
      const error = validateSingleField(field, form[field]);
      if (error) nextErrors[field] = error;
    });

    if (form.image) {
      if (!allowedTypes.includes(form.image.type)) nextErrors.image = "Only JPG, JPEG, PNG, and WEBP images are allowed.";
      else if (form.image.size > maxImageSize) nextErrors.image = "Image size must be less than 3MB.";
    }
    return nextErrors;
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: validateSingleField(field, value) }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setForm((current) => ({ ...current, image: null }));
      setPreview("");
      setErrors((current) => ({ ...current, image: "" }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors((current) => ({ ...current, image: "Only JPG, JPEG, PNG, and WEBP images are allowed." }));
      return;
    }

    if (file.size > maxImageSize) {
      setErrors((current) => ({ ...current, image: "Image size must be less than 3MB." }));
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
      description: "Water leakage is coming from the bathroom pipe and the floor stays wet.",
      image: null,
    });
    setPreview("");
    setErrors({});
  }

  function resetForm() {
    setForm(initialForm);
    setPreview("");
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      payload.append("hostelOrRoomNo", `${form.block.trim()} - Room ${form.roomNo.trim()}`);
      if (form.image) payload.append("image", form.image);

      const response = await api.post("/complaints", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const complaintId = response?.data?.data?.complaintId;
      const successMessage = complaintId
        ? `Complaint submitted successfully. Complaint ID: ${complaintId}`
        : response.data.message || "Complaint submitted successfully.";

      showPopup("success", successMessage);
      setForm(initialForm);
      setPreview("");
      setErrors({});
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Could not submit complaint right now.";
      showPopup("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <NaveBar />
      <Popup open={popupOpen} type={popupType} message={popupMessage} onClose={closePopup} />

      <main className="complaint-shell space-y-8">
        <section>
          <h1 className="text-3xl font-semibold text-slate-900">Submit New Complaint</h1>
          <p className="mt-2 text-sm text-slate-600">Fill out the form below to report a maintenance issue or concern.</p>
        </section>

        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="surface-card bg-gradient-to-br from-white via-indigo-50 to-violet-100 p-6 sm:p-7 shadow-xl border border-indigo-100 rounded-3xl"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Student Name *</label>
                <input
                  value={form.studentName}
                  onChange={(e) => handleChange("studentName", e.target.value)}
                  placeholder="e.g. Nimal Perera"
                  className={`soft-input mt-2 ${errors.studentName ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                  maxLength={20}
                />
                {errors.studentName ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.studentName}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Student ID *</label>
                <input
                  value={form.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  placeholder="e.g. IT20234567"
                  className={`soft-input mt-2 ${errors.studentId ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                  maxLength={20}
                />
                {errors.studentId ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.studentId}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`soft-select mt-2 ${errors.category ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                >
                  <option value="">Select a category</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                  <option value="WiFi">WiFi</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.category}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="mt-2 flex h-[50px] items-center rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-100 px-4 text-sm font-medium text-slate-700">
                  {priority}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Block / Hostel *</label>
                <input
                  value={form.block}
                  onChange={(e) => handleChange("block", e.target.value)}
                  placeholder="e.g. Girls A"
                  className={`soft-input mt-2 ${errors.block ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                />
                {errors.block ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.block}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Room Number *</label>
                <input
                  value={form.roomNo}
                  onChange={(e) => handleChange("roomNo", e.target.value)}
                  placeholder="e.g. 204"
                  className={`soft-input mt-2 ${errors.roomNo ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                />
                {errors.roomNo ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.roomNo}</p> : null}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows="6"
                placeholder="Describe the issue in detail..."
                className={`soft-textarea mt-2 resize-none ${errors.description ? "border-rose-300 bg-rose-50 focus:ring-rose-100" : ""}`}
                maxLength={500}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                {errors.description ? (
                  <p className="text-xs font-medium text-rose-600">{errors.description}</p>
                ) : (
                  <span className="text-xs text-slate-500">Minimum 15 characters</span>
                )}
                <span className="text-xs text-slate-500">{form.description.length}/500</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">Attachments (Optional)</label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-100/40 hover:scale-[1.01]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Upload className="text-slate-500" size={24} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, WEBP up to 3MB</p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {errors.image ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.image}</p> : null}

              {preview ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm">
                  <img src={preview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-5">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={resetForm} className="secondary-button">
                  <RefreshCcw size={16} />
                  Cancel
                </button>
                <button type="button" onClick={fillDummyData} className="secondary-button">
                  <Sparkles size={16} />
                  Use Dummy Data
                </button>
              </div>

              <button type="submit" disabled={submitting} className="primary-button">
                <Send size={16} />
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>

        <section className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="font-semibold text-slate-900">Fast Response</p>
            <p className="mt-2 text-sm text-slate-600">We aim to respond to all complaints within 24 hours.</p>
          </div>

          <div className="rounded-[24px] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="font-semibold text-slate-900">Real-time Updates</p>
            <p className="mt-2 text-sm text-slate-600">Track your complaint status in real-time.</p>
          </div>

          <div className="rounded-[24px] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-100 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="font-semibold text-slate-900">Priority Handling</p>
            <p className="mt-2 text-sm text-slate-600">Urgent issues are escalated immediately.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}