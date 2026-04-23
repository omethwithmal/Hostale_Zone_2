import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Download,
  FileStack,
  RefreshCw,
  ReceiptText,
  Save,
  ShieldAlert,
  UserRoundCog,
} from "lucide-react";
import {
  applyLateFeeToBill,
  deleteBill,
  deletePaymentRecord,
  generateBills,
  getAdminAlerts,
  getAdminPaymentDetails,
  getAdminPayments,
  getOutstandingReport,
  getOutstandingSummary,
  getPaymentPreview,
  getPaymentProfile,
  reviewPayment,
  updateBill,
  upsertPaymentProfile,
} from "../../api/paymentApi";
import {
  downloadBlob,
  formatCurrency,
  formatDisplayDate,
  getBillStatusClasses,
  getGradientByIndex,
  getPaymentStatusClasses,
  parseAdditionalFeesText,
  stringifyAdditionalFees,
} from "./paymentUtils";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Bar as BarChartCanvas, Doughnut } from "react-chartjs-2";

function getSlipPreviewType(url = "", fileName = "") {
  const normalizedUrl = String(url || "");
  const normalizedFileName = String(fileName || "").toLowerCase();

  if (normalizedUrl.startsWith("data:image/")) {
    return "image";
  }

  if (normalizedUrl.startsWith("data:application/pdf") || normalizedFileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalizedUrl) || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalizedFileName)) {
    return "image";
  }

  return "document";
}

const initialProfileForm = {
  studentId: "",
  roomNumber: "",
  block: "",
  currentBill: "",
  waterBill: "",
  additionalFeesText: "",
  lateFeeType: "percentage",
  lateFeeValue: "5",
  paymentWindowDays: "30",
  notes: "",
};

const initialGenerateForm = {
  studentId: "",
  billMonth: new Date().toISOString().slice(0, 7),
  overwrite: false,
};

const initialBillFilters = {
  status: "",
  billMonth: new Date().toISOString().slice(0, 7),
  roomNumber: "",
  block: "",
  studentId: "",
};

const initialPaymentFilters = {
  status: "",
  paymentMethod: "",
  billMonth: new Date().toISOString().slice(0, 7),
  roomNumber: "",
  block: "",
};

const chartColors = ["#2563eb", "#0891b2", "#1d4ed8", "#0f766e", "#4f46e5"];

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  ChartTooltip
);

function normalizePaymentStatus(payment) {
  if (!payment) {
    return "pending";
  }

  if (payment.paymentMethod !== "Card" && payment.status === "otp_sent") {
    return "pending";
  }

  return payment.status || "pending";
}

const PaymentManagementDashboard = ({ darkMode = false, students = [] }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generatingBills, setGeneratingBills] = useState(false);
  const [downloadingScope, setDownloadingScope] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [alerts, setAlerts] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [billDetails, setBillDetails] = useState([]);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [generateForm, setGenerateForm] = useState(initialGenerateForm);
  const [billFilters, setBillFilters] = useState(initialBillFilters);
  const [paymentFilters, setPaymentFilters] = useState(initialPaymentFilters);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [generatedBillsPreview, setGeneratedBillsPreview] = useState([]);
  const [lastGeneratedAt, setLastGeneratedAt] = useState("");
  const [updatingBillId, setUpdatingBillId] = useState("");
  const [billEditOpen, setBillEditOpen] = useState(false);
  const [billEditTarget, setBillEditTarget] = useState(null);
  const [billEditForm, setBillEditForm] = useState({
    roomPrice: "",
    currentBill: "",
    waterBill: "",
    lateFee: "",
    dueDate: "",
    notes: "",
  });
  const [slipPreview, setSlipPreview] = useState(null);

  const cardClass = darkMode
    ? "bg-gray-900/80 border border-gray-800 text-white"
    : "bg-white border border-blue-100 text-gray-900";

  const mutedTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const inputClass = `w-full rounded-xl border px-4 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
    : "bg-white border-blue-100 text-gray-900 placeholder:text-gray-400"
    }`;

  const loadDashboard = async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [alertsResponse, summaryResponse, paymentsResponse, billsResponse] =
        await Promise.all([
          getAdminAlerts(),
          getOutstandingSummary({
            scope: "monthly",
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
          }),
          getAdminPayments(paymentFilters),
          getAdminPaymentDetails(billFilters),
        ]);

      setAlerts(alertsResponse.data.alerts);
      setSummaryData(summaryResponse.data);
      setPaymentRequests(paymentsResponse.data.payments || []);
      setBillDetails(billsResponse.data.bills || []);
    } catch (error) {
      console.error("Failed to load payment management dashboard:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to load payment management data right now.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadDashboard(false);
    }
  }, [billFilters, paymentFilters]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setGenerateForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBillFilterChange = (event) => {
    const { name, value } = event.target;
    setBillFilters((current) => ({ ...current, [name]: value }));
  };

  const handlePaymentFilterChange = (event) => {
    const { name, value } = event.target;
    setPaymentFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSelectStudent = async (event) => {
    const studentId = event.target.value;
    const selectedStudent = students.find((student) => student.id === studentId);

    setProfileForm((current) => ({
      ...current,
      studentId,
      roomNumber: selectedStudent?.roomNumber || "",
      block: selectedStudent?.block || "",
      notes: "",
    }));
    setPricingPreview(null);
    setActiveProfile(null);

    if (!studentId) {
      return;
    }

    try {
      const response = await getPaymentProfile(studentId);
      const profile = response.data.profile;
      setActiveProfile(profile);
      setProfileForm({
        studentId,
        roomNumber: profile?.roomDetails?.roomNumber || selectedStudent?.roomNumber || "",
        block: profile?.roomDetails?.block || selectedStudent?.block || "",
        currentBill: String(profile?.charges?.currentBill ?? ""),
        waterBill: String(profile?.charges?.waterBill ?? ""),
        additionalFeesText: stringifyAdditionalFees(
          profile?.charges?.additionalFees || []
        ),
        lateFeeType: profile?.charges?.lateFeeType || "percentage",
        lateFeeValue: String(profile?.charges?.lateFeeValue ?? "5"),
        paymentWindowDays: String(profile?.charges?.paymentWindowDays ?? "30"),
        notes: profile?.notes || "",
      });
      setPricingPreview({
        pricing: profile?.pricing,
        roomDetails: profile?.roomDetails,
      });
    } catch (error) {
      console.error("Failed to load student fee profile:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "Unable to load the selected profile.",
      });
    }
  };

  const buildProfilePayload = () => ({
    roomNumber: profileForm.roomNumber,
    block: profileForm.block,
    currentBill: Number(profileForm.currentBill || 0),
    waterBill: Number(profileForm.waterBill || 0),
    additionalFees: parseAdditionalFeesText(profileForm.additionalFeesText),
    lateFeeType: profileForm.lateFeeType,
    lateFeeValue: Number(profileForm.lateFeeValue || 0),
    paymentWindowDays: Number(profileForm.paymentWindowDays || 30),
    notes: profileForm.notes,
    isActive: true,
  });

  const handlePreviewPricing = async () => {
    if (!profileForm.studentId) {
      setFeedback({
        type: "error",
        message: "Select a student before previewing the fee profile.",
      });
      return;
    }

    try {
      const response = await getPaymentPreview({
        studentId: profileForm.studentId,
        ...buildProfilePayload(),
      });
      setPricingPreview(response.data.preview);
      setFeedback({
        type: "success",
        message: "Pricing preview updated successfully.",
      });
    } catch (error) {
      console.error("Failed to preview pricing:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "Unable to preview pricing.",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.studentId) {
      setFeedback({
        type: "error",
        message: "Select a student before saving the fee profile.",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const response = await upsertPaymentProfile(
        profileForm.studentId,
        buildProfilePayload()
      );
      setActiveProfile(response.data.profile);
      setPricingPreview({
        pricing: response.data.pricing,
        roomDetails: response.data.profile?.roomDetails,
      });
      setFeedback({
        type: "success",
        message: "Student fee profile saved successfully.",
      });
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to save fee profile:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "Unable to save the fee profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateBills = async (event) => {
    event.preventDefault();
    setGeneratingBills(true);
    try {
      const response = await generateBills({
        billMonth: generateForm.billMonth,
        studentId: generateForm.studentId || undefined,
        overwrite: generateForm.overwrite,
      });

      const generatedBills = response.data.bills || [];
      setGeneratedBillsPreview(generatedBills);
      setLastGeneratedAt(new Date().toISOString());

      setFeedback({
        type: "success",
        message: `${response.data.count || 0} bill(s) generated successfully. Preview updated below.`,
      });
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to generate bills:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "Unable to generate bills.",
      });
    } finally {
      setGeneratingBills(false);
    }
  };

  const escapeCsvValue = (value) => {
    const raw = String(value ?? "");
    if (raw.includes('"') || raw.includes(",") || raw.includes("\n")) {
      return `"${raw.replaceAll('"', '""')}"`;
    }
    return raw;
  };

  const handleDownloadGeneratedBillsCsv = () => {
    if (!generatedBillsPreview.length) {
      setFeedback({
        type: "error",
        message: "Generate bills first to export the generated bill preview.",
      });
      return;
    }

    const headers = [
      "Bill ID",
      "Bill Month",
      "Student IT Number",
      "Student Name",
      "Email",
      "Room Number",
      "Block",
      "Status",
      "Issued Date",
      "Due Date",
      "Room Price",
      "Current Bill",
      "Water Bill",
      "Late Fee",
      "Subtotal",
      "Total",
      "Paid",
      "Outstanding",
      "Created",
    ];

    const rows = generatedBillsPreview.map((bill) => [
      bill.billId,
      bill.billMonth,
      bill.student?.itNumber || "",
      bill.student?.fullName || "",
      bill.student?.email || "",
      bill.student?.roomNumber || "",
      bill.student?.block || "",
      bill.status,
      bill.issuedDate,
      bill.dueDate,
      Number(bill.breakdown?.roomPrice || 0),
      Number(bill.breakdown?.currentBill || 0),
      Number(bill.breakdown?.waterBill || 0),
      Number(bill.breakdown?.lateFee || 0),
      Number(bill.totals?.subtotal || 0),
      Number(bill.totals?.total || 0),
      Number(bill.totals?.paid || 0),
      Number(bill.totals?.outstanding || 0),
      bill.created ? "Yes" : "No",
    ]);

    const csvText = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    downloadBlob(
      blob,
      `generated-bills-preview-${new Date().toISOString().slice(0, 10)}.csv`
    );

    setFeedback({
      type: "success",
      message: "Generated bills preview CSV downloaded successfully.",
    });
  };

  const handleReviewPayment = async (paymentId, action) => {
    const reason =
      globalThis.prompt(`Optional reason for ${action}ing this payment:`) || "";

    try {
      await reviewPayment(paymentId, { action, reason });
      setFeedback({
        type: "success",
        message: `Payment ${action}ed successfully.`,
      });
      await loadDashboard(false);
    } catch (error) {
      console.error(`Failed to ${action} payment:`, error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || `Unable to ${action} this payment.`,
      });
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!globalThis.confirm("Delete this payment record?")) {
      return;
    }

    try {
      await deletePaymentRecord(paymentId);
      setFeedback({
        type: "success",
        message: "Payment record deleted successfully.",
      });
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to delete payment record:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "Unable to delete payment record.",
      });
    }
  };

  const openSlipPreview = (payment) => {
    setSlipPreview({
      url: payment.receiptUrl || "",
      fileName: payment.receiptUrl?.split("/").pop() || "Uploaded slip",
    });
  };

  const closeSlipPreview = () => {
    setSlipPreview(null);
  };

  const slipPreviewType = getSlipPreviewType(
    slipPreview?.url || "",
    slipPreview?.fileName || ""
  );

  const handleApplyLateFee = async (billId) => {
    try {
      await applyLateFeeToBill(billId);
      setFeedback({
        type: "success",
        message: "Late fee applied successfully.",
      });
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to apply late fee:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Unable to apply late fee.",
      });
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!globalThis.confirm("Delete this bill permanently?")) {
      return;
    }

    try {
      await deleteBill(billId);
      setFeedback({
        type: "success",
        message: "Bill deleted successfully.",
      });
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to delete bill:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Unable to delete the bill.",
      });
    }
  };

  const handleDownloadReport = async (scope) => {
    setDownloadingScope(scope);
    try {
      const response = await getOutstandingReport(
        {
          scope,
          year: summaryData?.year || new Date().getFullYear(),
          month: summaryData?.month || new Date().getMonth() + 1,
        },
        "csv"
      );

      downloadBlob(
        response.data,
        `payment-${scope}-report-${new Date().toISOString().slice(0, 10)}.csv`
      );

      setFeedback({
        type: "success",
        message: `${scope === "annual" ? "Annual" : "Monthly"} report downloaded.`,
      });
    } catch (error) {
      console.error("Failed to download report:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Unable to download report.",
      });
    } finally {
      setDownloadingScope("");
    }
  };

  const openBillEditModal = (bill) => {
    setBillEditTarget(bill);
    setBillEditForm({
      roomPrice: String(bill.breakdown?.roomPrice ?? 0),
      currentBill: String(bill.breakdown?.currentBill ?? 0),
      waterBill: String(bill.breakdown?.waterBill ?? 0),
      lateFee: String(bill.breakdown?.lateFee ?? 0),
      dueDate: bill.dueDate ? String(bill.dueDate).slice(0, 10) : "",
      notes: bill.notes || "",
    });
    setBillEditOpen(true);
  };

  const closeBillEditModal = () => {
    setBillEditOpen(false);
    setBillEditTarget(null);
  };

  const handleBillEditFieldChange = (event) => {
    const { name, value } = event.target;
    setBillEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmitBillEdit = async (event) => {
    event.preventDefault();

    if (!billEditTarget) {
      return;
    }

    setUpdatingBillId(billEditTarget.id);
    try {
      await updateBill(billEditTarget.id, {
        roomPrice: Number(billEditForm.roomPrice || 0),
        currentBill: Number(billEditForm.currentBill || 0),
        waterBill: Number(billEditForm.waterBill || 0),
        lateFee: Number(billEditForm.lateFee || 0),
        dueDate: billEditForm.dueDate || undefined,
        notes: billEditForm.notes,
      });

      setFeedback({
        type: "success",
        message: "Bill updated successfully.",
      });
      closeBillEditModal();
      await loadDashboard(false);
    } catch (error) {
      console.error("Failed to update bill:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Unable to update the bill.",
      });
    } finally {
      setUpdatingBillId("");
    }
  };

  const blockChartData = summaryData?.byBlock || [];
  const paymentStatusData = [
    {
      name: "Pending",
      value: paymentRequests.filter((item) => item.status === "pending").length,
    },
    {
      name: "Accepted",
      value: paymentRequests.filter((item) => item.status === "accepted").length,
    },
    {
      name: "Rejected",
      value: paymentRequests.filter((item) => item.status === "rejected").length,
    },
    {
      name: "Cancelled",
      value: paymentRequests.filter((item) => item.status === "cancelled").length,
    },
  ].filter((item) => item.value > 0);

  const blockBarData = {
    labels: blockChartData.map((item) => item.block),
    datasets: [
      {
        label: "Outstanding",
        data: blockChartData.map((item) => item.totalOutstanding),
        backgroundColor: blockChartData.map(
          (_, index) => chartColors[index % chartColors.length]
        ),
        borderRadius: 12,
      },
    ],
  };

  const blockBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const paymentStatusChartData = {
    labels: (paymentStatusData.length ? paymentStatusData : [{ name: "No Data", value: 1 }]).map(
      (item) => item.name
    ),
    datasets: [
      {
        data: (paymentStatusData.length ? paymentStatusData : [{ name: "No Data", value: 1 }]).map(
          (item) => item.value
        ),
        backgroundColor: (paymentStatusData.length ? paymentStatusData : [{ name: "No Data", value: 1 }]).map(
          (_, index) => chartColors[index % chartColors.length]
        ),
        borderWidth: 0,
      },
    ],
  };

  const selectedStudent = students.find(
    (student) => student.id === profileForm.studentId
  );

  const totalLateFees = billDetails.reduce(
    (sum, bill) => sum + Number(bill.breakdown?.lateFee || 0),
    0
  );

  const paymentActionsFor = (payment) => {
    return ["accept", "reject", "cancel"];
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={mutedTextClass}>Loading payment management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback.message && (
        <div
          className={`rounded-2xl border px-4 py-3 shadow-sm ${feedback.type === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle size={16} />
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            title: "Hostel Outstanding",
            value: formatCurrency(summaryData?.hostelOutstanding || 0),
            subtitle: `${summaryData?.scope || "monthly"} summary`,
            icon: <ShieldAlert size={20} />,
          },
          {
            title: "Total Paid",
            value: formatCurrency(summaryData?.totalPaid || 0),
            subtitle: `${billDetails.length} filtered bills`,
            icon: <CreditCard size={20} />,
          },
          {
            title: "Late Fees",
            value: formatCurrency(totalLateFees),
            subtitle: `${alerts?.overdueCount || 0} overdue students`,
            icon: <ReceiptText size={20} />,
          },
          {
            title: "Pending Requests",
            value: `${paymentRequests.filter((item) => item.status === "pending").length}`,
            subtitle: `${alerts?.dueSoonCount || 0} due soon`,
            icon: <FileStack size={20} />,
          },
        ].map((item, index) => (
          <div key={item.title} className={`${cardClass} rounded-2xl p-5 shadow-md`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.25em] ${mutedTextClass}`}>
                  {item.title}
                </p>
                <p className="mt-3 text-2xl font-bold">{item.value}</p>
                <p className={`mt-2 text-sm ${mutedTextClass}`}>{item.subtitle}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getGradientByIndex(
                  index
                )} text-white flex items-center justify-center shadow-lg`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${cardClass} rounded-2xl p-5 shadow-md xl:col-span-2`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold">Block Outstanding Overview</h3>
              <p className={`text-sm ${mutedTextClass}`}>
                Track monthly or annual outstanding amounts block by block.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadDashboard(false)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition ${darkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-blue-100 hover:bg-blue-50"
                }`}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <div className="h-72">
            <BarChartCanvas data={blockBarData} options={blockBarOptions} />
          </div>
        </div>

        <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Alerts Snapshot</h3>
              <p className={`text-sm ${mutedTextClass}`}>
                Admin reminders for overdue and due-soon students.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className={`${darkMode ? "bg-gray-800" : "bg-red-50"} rounded-2xl p-4`}>
              <p className="text-sm font-medium text-red-500">Overdue Students</p>
              <p className="mt-2 text-3xl font-bold">{alerts?.overdueCount || 0}</p>
            </div>
            <div className={`${darkMode ? "bg-gray-800" : "bg-amber-50"} rounded-2xl p-4`}>
              <p className="text-sm font-medium text-amber-500">Due Within 7 Days</p>
              <p className="mt-2 text-3xl font-bold">{alerts?.dueSoonCount || 0}</p>
            </div>
            <div className="space-y-2">
              {(alerts?.overdueStudents || []).slice(0, 4).map((studentBill) => (
                <div
                  key={studentBill.id}
                  className={`rounded-xl px-3 py-2 text-sm ${darkMode ? "bg-gray-800" : "bg-blue-50"
                    }`}
                >
                  <div className="font-semibold">{studentBill.student?.fullName}</div>
                  <div className={mutedTextClass}>
                    {studentBill.student?.roomNumber || "No room"} · {formatCurrency(
                      studentBill.totals?.outstanding || 0
                    )}
                  </div>
                </div>
              ))}
              {!alerts?.overdueStudents?.length && (
                <p className={`text-sm ${mutedTextClass}`}>No overdue students right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleGenerateBills} className={`${cardClass} rounded-2xl p-5 shadow-md`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ReceiptText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generate Monthly Bills</h3>
              <p className={`text-sm ${mutedTextClass}`}>
                Create current-month bills for one student or the full hostel.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                Billing Month
              </label>
              <input
                type="month"
                name="billMonth"
                value={generateForm.billMonth}
                onChange={handleGenerateFieldChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                Student
              </label>
              <select
                name="studentId"
                value={generateForm.studentId}
                onChange={handleGenerateFieldChange}
                className={inputClass}
              >
                <option value="">All active students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.itNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              name="overwrite"
              checked={generateForm.overwrite}
              onChange={handleGenerateFieldChange}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${mutedTextClass}`}>
              Overwrite existing bills for the selected month
            </span>
          </label>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="submit"
              disabled={generatingBills}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              <ReceiptText size={18} />
              {generatingBills ? "Generating..." : "Generate Bills"}
            </button>
            <button
              type="button"
              onClick={() => handleDownloadReport("monthly")}
              disabled={downloadingScope === "monthly"}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${darkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-blue-100 hover:bg-blue-50"
                } disabled:opacity-60`}
            >
              <Download size={18} />
              Monthly CSV
            </button>
            <button
              type="button"
              onClick={() => handleDownloadReport("annual")}
              disabled={downloadingScope === "annual"}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${darkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-blue-100 hover:bg-blue-50"
                } disabled:opacity-60`}
            >
              <Download size={18} />
              Annual CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadGeneratedBillsCsv}
              disabled={!generatedBillsPreview.length}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${darkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-blue-100 hover:bg-blue-50"
                } disabled:opacity-60`}
            >
              <Download size={18} />
              Generated Preview CSV
            </button>
          </div>
        </form>

        <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Payment Status Mix</h3>
              <p className={`text-sm ${mutedTextClass}`}>
                Review pending, approved, and cancelled payment requests.
              </p>
            </div>
          </div>
          <div className="h-72">
            <Doughnut
              data={paymentStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: darkMode ? "#cbd5e1" : "#475569",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {!!generatedBillsPreview.length && (
        <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Generated Bill Preview</h3>
              <p className={`text-sm ${mutedTextClass}`}>
                Showing {generatedBillsPreview.length} bill(s) from the latest generation request.
                {lastGeneratedAt ? ` Last generated on ${formatDisplayDate(lastGeneratedAt)}.` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadGeneratedBillsCsv}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition ${darkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-blue-100 hover:bg-blue-50"
                }`}
            >
              <Download size={16} />
              Export This Preview
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  <th className="text-left py-3 pr-4">Student</th>
                  <th className="text-left py-3 pr-4">Bill Month</th>
                  <th className="text-left py-3 pr-4">Room / Block</th>
                  <th className="text-left py-3 pr-4">Totals</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {generatedBillsPreview.map((bill) => (
                  <tr
                    key={bill.id}
                    className={`border-t ${darkMode ? "border-gray-800" : "border-blue-50"}`}
                  >
                    <td className="py-4 pr-4">
                      <div className="font-semibold">{bill.student?.fullName || "-"}</div>
                      <div className={`text-sm ${mutedTextClass}`}>
                        {bill.student?.itNumber || "No IT"} · {bill.billId}
                      </div>
                    </td>
                    <td className="py-4 pr-4">{bill.billMonth}</td>
                    <td className="py-4 pr-4">
                      <div>{bill.student?.roomNumber || "-"}</div>
                      <div className={`text-sm ${mutedTextClass}`}>{bill.student?.block || "-"}</div>
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      <div>Total: {formatCurrency(bill.totals?.total || 0)}</div>
                      <div>Paid: {formatCurrency(bill.totals?.paid || 0)}</div>
                      <div>Outstanding: {formatCurrency(bill.totals?.outstanding || 0)}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getBillStatusClasses(
                          bill.status
                        )}`}
                      >
                        {String(bill.status || "pending").replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{formatDisplayDate(bill.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold">Payment Requests</h3>
            <p className={`text-sm ${mutedTextClass}`}>
              Review student payment details and approve, reject, cancel, or delete requests.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              name="status"
              value={paymentFilters.status}
              onChange={handlePaymentFilterChange}
              className={inputClass}
            >
              <option value="">All statuses</option>
              <option value="otp_sent">OTP Sent</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              name="paymentMethod"
              value={paymentFilters.paymentMethod}
              onChange={handlePaymentFilterChange}
              className={inputClass}
            >
              <option value="">All methods</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="Cash Deposit">Cash Deposit</option>
            </select>
            <input
              type="month"
              name="billMonth"
              value={paymentFilters.billMonth}
              onChange={handlePaymentFilterChange}
              className={inputClass}
            />
            <input
              type="text"
              name="roomNumber"
              value={paymentFilters.roomNumber}
              onChange={handlePaymentFilterChange}
              placeholder="Room"
              className={inputClass}
            />
            <input
              type="text"
              name="block"
              value={paymentFilters.block}
              onChange={handlePaymentFilterChange}
              placeholder="Block"
              className={inputClass}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className={darkMode ? "text-gray-400" : "text-gray-500"}>
                <th className="text-left py-3 pr-4">Student</th>
                <th className="text-left py-3 pr-4">Bill Month</th>
                <th className="text-left py-3 pr-4">Method</th>
                <th className="text-left py-3 pr-4">Amount</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3 pr-4">Created</th>
                <th className="text-left py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentRequests.map((payment) => (
                <tr
                  key={payment.id}
                  className={`border-t align-top ${darkMode ? "border-gray-800" : "border-blue-50"}`}
                >
                  <td className="py-4 pr-4">
                    <div className="font-semibold">{payment.student?.fullName || "-"}</div>
                    <div className={`text-sm ${mutedTextClass}`}>
                      {payment.student?.itNumber || "No IT"} · {payment.billId || "No bill"}
                    </div>
                  </td>
                  <td className="py-4 pr-4">{payment.billSnapshot?.billMonth || "-"}</td>
                  <td className="py-4 pr-4">
                    <div>{payment.paymentMethod}</div>
                    {payment.paymentMethod === "Card" && payment.cardDetails?.last4 && (
                      <div className={`text-sm ${mutedTextClass}`}>
                        {payment.cardDetails.network || "Card"} **** {payment.cardDetails.last4}
                      </div>
                    )}
                    {payment.referenceNumber && (
                      <div className={`text-xs ${mutedTextClass}`}>
                        Ref: {payment.referenceNumber}
                      </div>
                    )}
                    {payment.transactionReference && (
                      <div className={`text-xs ${mutedTextClass}`}>
                        Txn: {payment.transactionReference}
                      </div>
                    )}
                    {payment.receiptUrl && (
                      <button
                        type="button"
                        onClick={() => openSlipPreview(payment)}
                        className="text-left text-xs text-blue-600 hover:underline"
                      >
                        Preview slip
                      </button>
                    )}
                  </td>
                  <td className="py-4 pr-4 font-semibold">{formatCurrency(payment.amount || 0)}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getPaymentStatusClasses(
                        normalizePaymentStatus(payment)
                      )}`}
                    >
                      {String(normalizePaymentStatus(payment) || "pending").replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 pr-4">{formatDisplayDate(payment.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {paymentActionsFor(payment).includes("accept") && (
                        <button
                          type="button"
                          onClick={() => handleReviewPayment(payment.id, "accept")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs"
                        >
                          Accept
                        </button>
                      )}
                      {paymentActionsFor(payment).includes("reject") && (
                        <button
                          type="button"
                          onClick={() => handleReviewPayment(payment.id, "reject")}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs"
                        >
                          Reject
                        </button>
                      )}
                      {paymentActionsFor(payment).includes("cancel") && (
                        <button
                          type="button"
                          onClick={() => handleReviewPayment(payment.id, "cancel")}
                          className="px-3 py-1.5 rounded-lg bg-gray-600 text-white text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePayment(payment.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!paymentRequests.length && (
                <tr>
                  <td colSpan="7" className={`py-8 text-center ${mutedTextClass}`}>
                    No payment requests match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {billEditOpen && billEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBillEditModal}
            aria-label="Close update bill modal backdrop"
          />

          <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border ${cardClass} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-blue-100/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Update Bill</h3>
                  <p className="text-sm text-blue-100 mt-1">
                    {billEditTarget.billId} · {billEditTarget.student?.fullName || "Selected student"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeBillEditModal}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition"
                  aria-label="Close update bill modal"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBillEdit} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Room Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="roomPrice"
                    value={billEditForm.roomPrice}
                    onChange={handleBillEditFieldChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Current Bill
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="currentBill"
                    value={billEditForm.currentBill}
                    onChange={handleBillEditFieldChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Water Bill
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="waterBill"
                    value={billEditForm.waterBill}
                    onChange={handleBillEditFieldChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Late Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="lateFee"
                    value={billEditForm.lateFee}
                    onChange={handleBillEditFieldChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={billEditForm.dueDate}
                    onChange={handleBillEditFieldChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Notes
                </label>
                <textarea
                  rows="4"
                  name="notes"
                  value={billEditForm.notes}
                  onChange={handleBillEditFieldChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Optional notes for this bill"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-sm text-gray-500">
                  Changes are saved directly to the database.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeBillEditModal}
                    className={`px-5 py-3 rounded-xl border transition ${darkMode
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-blue-100 hover:bg-blue-50"
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingBillId === billEditTarget.id}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {updatingBillId === billEditTarget.id ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <UserRoundCog size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Student Fee Profile</h3>
            <p className={`text-sm ${mutedTextClass}`}>
              Define room-linked monthly fees, utility bills, and late payment rules.
            </p>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.3fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Student
                </label>
                <select
                  value={profileForm.studentId}
                  onChange={handleSelectStudent}
                  className={inputClass}
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} ({student.roomNumber || "No room"})
                    </option>
                  ))}

                </select>
              </div>

              {slipPreview?.url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={closeSlipPreview}
                    aria-label="Close slip preview backdrop"
                  />

                  <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border ${cardClass} overflow-hidden`}>
                    <div className="px-6 py-4 border-b border-blue-100/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">Slip Preview</h3>
                        <p className="text-sm text-blue-100 mt-1">Payment slip from the selected request</p>
                      </div>
                      <button
                        type="button"
                        onClick={closeSlipPreview}
                        className="rounded-full bg-white/10 hover:bg-white/20 p-2 transition"
                        aria-label="Close slip preview"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>

                    <div className="p-6">
                      {slipPreviewType === "image" ? (
                        <img
                          src={slipPreview.url}
                          alt="Payment slip preview"
                          className="max-h-[75vh] w-full object-contain rounded-2xl border border-gray-200 bg-gray-50"
                        />
                      ) : (
                        <iframe
                          title="Payment slip preview"
                          src={slipPreview.url}
                          className="h-[75vh] w-full rounded-2xl border border-gray-200 bg-gray-50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={profileForm.roomNumber}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Block
                </label>
                <input
                  type="text"
                  name="block"
                  value={profileForm.block}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Current Bill
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="currentBill"
                  value={profileForm.currentBill}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Water Bill
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="waterBill"
                  value={profileForm.waterBill}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Late Fee Type
                </label>
                <select
                  name="lateFeeType"
                  value={profileForm.lateFeeType}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Late Fee Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="lateFeeValue"
                  value={profileForm.lateFeeValue}
                  onChange={handleProfileFieldChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Additional Fees
                </label>
                <textarea
                  rows="4"
                  name="additionalFeesText"
                  value={profileForm.additionalFeesText}
                  onChange={handleProfileFieldChange}
                  className={`${inputClass} resize-none`}
                  placeholder={"Maintenance Fee: 500\nSecurity Fee: 750"}
                />
                <p className={`mt-2 text-xs ${mutedTextClass}`}>
                  One fee per line using the format <code>Label: Amount</code>.
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                  Notes
                </label>
                <textarea
                  rows="4"
                  name="notes"
                  value={profileForm.notes}
                  onChange={handleProfileFieldChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Optional note for this student's fee profile"
                />
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${mutedTextClass}`}>
                    Payment Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="paymentWindowDays"
                    value={profileForm.paymentWindowDays}
                    onChange={handleProfileFieldChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePreviewPricing}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${darkMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-blue-100 hover:bg-blue-50"
                  }`}
              >
                <BarChart3 size={18} />
                Preview Pricing
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                <Save size={18} />
                {savingProfile ? "Saving..." : "Save Fee Profile"}
              </button>
            </div>
          </div>

          <div className={`${darkMode ? "bg-gray-950" : "bg-blue-50/70"} rounded-2xl p-5 border ${darkMode ? "border-gray-800" : "border-blue-100"}`}>
            <h4 className="text-lg font-semibold">Pricing Summary</h4>
            <p className={`text-sm mt-1 ${mutedTextClass}`}>
              Room price plus related student bills before monthly bill generation.
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className={mutedTextClass}>Student</span>
                <span className="font-medium">{selectedStudent?.fullName || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Created At</span>
                <span className="font-medium">
                  {activeProfile?.createdAt ? formatDisplayDate(activeProfile.createdAt) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Updated At</span>
                <span className="font-medium">
                  {activeProfile?.updatedAt ? formatDisplayDate(activeProfile.updatedAt) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Room</span>
                <span className="font-medium">
                  {pricingPreview?.roomDetails?.roomNumber ||
                    activeProfile?.roomDetails?.roomNumber ||
                    "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Block</span>
                <span className="font-medium">
                  {pricingPreview?.roomDetails?.block ||
                    activeProfile?.roomDetails?.block ||
                    "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Room Price</span>
                <span className="font-medium">
                  {formatCurrency(
                    pricingPreview?.pricing?.roomPrice ||
                    activeProfile?.pricing?.roomPrice ||
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Current Bill</span>
                <span className="font-medium">
                  {formatCurrency(
                    pricingPreview?.pricing?.currentBill ||
                    activeProfile?.pricing?.currentBill ||
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Water Bill</span>
                <span className="font-medium">
                  {formatCurrency(
                    pricingPreview?.pricing?.waterBill ||
                    activeProfile?.pricing?.waterBill ||
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedTextClass}>Additional Fees</span>
                <span className="font-medium">
                  {formatCurrency(
                    pricingPreview?.pricing?.additionalFeesTotal ||
                    activeProfile?.pricing?.additionalFeesTotal ||
                    0
                  )}
                </span>
              </div>
              <div className={`flex justify-between pt-3 border-t ${darkMode ? "border-gray-800" : "border-blue-100"}`}>
                <span className="font-semibold">Total Monthly Price</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(
                    pricingPreview?.pricing?.total ||
                    activeProfile?.pricing?.total ||
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} rounded-2xl p-5 shadow-md`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold">Bill Tracking</h3>
            <p className={`text-sm ${mutedTextClass}`}>
              Filter paid, pending, and overdue bills room-wise and student-wise.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              name="status"
              value={billFilters.status}
              onChange={handleBillFilterChange}
              className={inputClass}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="month"
              name="billMonth"
              value={billFilters.billMonth}
              onChange={handleBillFilterChange}
              className={inputClass}
            />
            <input
              type="text"
              name="roomNumber"
              value={billFilters.roomNumber}
              onChange={handleBillFilterChange}
              placeholder="Room"
              className={inputClass}
            />
            <input
              type="text"
              name="block"
              value={billFilters.block}
              onChange={handleBillFilterChange}
              placeholder="Block"
              className={inputClass}
            />
            <select
              name="studentId"
              value={billFilters.studentId}
              onChange={handleBillFilterChange}
              className={inputClass}
            >
              <option value="">All students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className={darkMode ? "text-gray-400" : "text-gray-500"}>
                <th className="text-left py-3 pr-4">Student</th>
                <th className="text-left py-3 pr-4">Room</th>
                <th className="text-left py-3 pr-4">Bill Month</th>
                <th className="text-left py-3 pr-4">Breakdown</th>
                <th className="text-left py-3 pr-4">Outstanding</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3 pr-4">Due Date</th>
                <th className="text-left py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billDetails.map((bill) => (
                <tr
                  key={bill.id}
                  className={`border-t align-top ${darkMode ? "border-gray-800" : "border-blue-50"}`}
                >
                  <td className="py-4 pr-4">
                    <div className="font-semibold">{bill.student?.fullName}</div>
                    <div className={`text-sm ${mutedTextClass}`}>{bill.student?.itNumber}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div>{bill.student?.roomNumber || "-"}</div>
                    <div className={`text-sm ${mutedTextClass}`}>{bill.student?.block || "-"}</div>
                  </td>
                  <td className="py-4 pr-4">{bill.billMonth}</td>
                  <td className="py-4 pr-4 text-sm">
                    <div>Room: {formatCurrency(bill.breakdown?.roomPrice || 0)}</div>
                    <div>Current: {formatCurrency(bill.breakdown?.currentBill || 0)}</div>
                    <div>Water: {formatCurrency(bill.breakdown?.waterBill || 0)}</div>
                    <div>Late: {formatCurrency(bill.breakdown?.lateFee || 0)}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-semibold">{formatCurrency(bill.totals?.outstanding || 0)}</div>
                    <div className={`text-sm ${mutedTextClass}`}>
                      Paid {formatCurrency(bill.totals?.paid || 0)}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getBillStatusClasses(
                        bill.status
                      )}`}
                    >
                      {bill.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 pr-4">{formatDisplayDate(bill.dueDate)}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyLateFee(bill.id)}
                        disabled={bill.status === "paid" || bill.status === "cancelled"}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-40"
                      >
                        Add Late Fee
                      </button>
                      <button
                        type="button"
                        onClick={() => openBillEditModal(bill)}
                        disabled={updatingBillId === bill.id}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs disabled:opacity-40"
                      >
                        {updatingBillId === bill.id ? "Updating..." : "Update Bill"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBill(bill.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!billDetails.length && (
                <tr>
                  <td colSpan="8" className={`py-8 text-center ${mutedTextClass}`}>
                    No bills match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagementDashboard;
