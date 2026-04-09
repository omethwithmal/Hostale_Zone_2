import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

const currency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const compactCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "LKR 0";
  return `LKR ${new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: amount >= 1000000 ? 1 : 0,
  }).format(amount)}`;
};

const fmtDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const BILL_TYPES = [
  { value: "hostel_fee", label: "Hostel Fee" },
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "other", label: "Other" },
];

const BLOCK_OPTIONS = [
  { value: "all", label: "All Blocks", accent: "#cbd5e1", bg: "rgba(255,255,255,.04)" },
  { value: "A", label: "Block A", accent: "#93c5fd", bg: "rgba(59,130,246,.12)" },
  { value: "B", label: "Block B", accent: "#c4b5fd", bg: "rgba(124,58,237,.12)" },
  { value: "C", label: "Block C", accent: "#67e8f9", bg: "rgba(6,182,212,.12)" },
];

const inputStyle = {
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.08)",
  color: "#f8fafc",
  borderRadius: 12,
  padding: "11px 13px",
  width: "100%",
};

const cardStyle = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(255,255,255,.06)",
  borderRadius: 20,
};

const metricValueStyle = {
  marginTop: 8,
  fontFamily: "'Syne',sans-serif",
  fontSize: 20,
  fontWeight: 800,
  color: "#f8fafc",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  wordBreak: "break-word",
};

export default function AdminFeeModule({ token, showToast }) {
  const [summaryRows, setSummaryRows] = useState([]);
  const [structures, setStructures] = useState([]);
  const [bills, setBills] = useState([]);
  const [reports, setReports] = useState(null);
  const [blockSummary, setBlockSummary] = useState(null);
  const [editingStructureId, setEditingStructureId] = useState("");
  const [editingBillId, setEditingBillId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [structureStudentIds, setStructureStudentIds] = useState([]);
  const [studentPickerSearch, setStudentPickerSearch] = useState("");
  const [structurePickerSearch, setStructurePickerSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ search: "", status: "all", billStatus: "all", block: "all" });
  const [structureForm, setStructureForm] = useState({
    title: "",
    feeType: "hostel_fee",
    billingCycle: "monthly",
    amount: "",
    dueDay: 10,
    lateFeeType: "fixed",
    lateFeeValue: "250",
    roomLabel: "",
    flowLabel: "",
    description: "",
  });
  const [billForm, setBillForm] = useState({
    feeStructureId: "",
    title: "",
    billType: "hostel_fee",
    billingCycle: "monthly",
    amount: "",
    dueDate: "",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    roomLabel: "",
    flowLabel: "",
    description: "",
    lateFeeType: "fixed",
    lateFeeValue: "250",
  });
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    billId: "",
    amount: "",
    paymentMethod: "cash",
    referenceNumber: "",
    cardNumber: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [structureEditForm, setStructureEditForm] = useState({
    title: "",
    feeType: "hostel_fee",
    billingCycle: "monthly",
    amount: "",
    dueDay: 10,
    lateFeeType: "fixed",
    lateFeeValue: "250",
    roomLabel: "",
    flowLabel: "",
    description: "",
    assignedStudentIds: [],
    isActive: true,
  });
  const [billEditForm, setBillEditForm] = useState({
    title: "",
    dueDate: "",
    baseAmount: "",
    lateFeeType: "fixed",
    lateFeeValue: "250",
    roomLabel: "",
    flowLabel: "",
    description: "",
    cancelReason: "",
  });

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, structuresRes, billsRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/api/fees/admin/students?search=${encodeURIComponent(query.search)}&status=${query.status}&block=${encodeURIComponent(query.block)}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/fees/admin/fee-structures`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/fees/admin/bills?status=${query.billStatus}&search=${encodeURIComponent(query.search)}&block=${encodeURIComponent(query.block)}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/fees/admin/reports?block=${encodeURIComponent(query.block)}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [studentsData, structuresData, billsData, reportsData] = await Promise.all([
        studentsRes.json(),
        structuresRes.json(),
        billsRes.json(),
        reportsRes.json(),
      ]);

      if (!studentsRes.ok) throw new Error(studentsData.message || "Failed to load financials.");
      if (!structuresRes.ok) throw new Error(structuresData.message || "Failed to load fee structures.");
      if (!billsRes.ok) throw new Error(billsData.message || "Failed to load bills.");
      if (!reportsRes.ok) throw new Error(reportsData.message || "Failed to load reports.");

      setSummaryRows(studentsData.students || []);
      setBlockSummary(studentsData.summary || null);
      setStructures(structuresData.structures || []);
      setBills(billsData.bills || []);
      setReports(reportsData);
    } catch (err) {
      showToast?.("error", err.message || "Unable to load fee module.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [query.status, query.billStatus, query.block]);

  const filteredRows = useMemo(() => {
    if (!query.search.trim()) return summaryRows;
    const q = query.search.toLowerCase();
    return summaryRows.filter((row) =>
      [row.student?.fullName, row.student?.email, row.student?.studentId]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [summaryRows, query.search]);

  const pickerRows = useMemo(() => {
    if (!studentPickerSearch.trim()) return summaryRows;
    const q = studentPickerSearch.toLowerCase();
    return summaryRows.filter((row) =>
      [row.student?.fullName, row.student?.email, row.student?.studentId]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [summaryRows, studentPickerSearch]);

  const selectedStructure = useMemo(
    () => structures.find((item) => item._id === billForm.feeStructureId) || null,
    [structures, billForm.feeStructureId]
  );

  const structureAssignedCount = useMemo(
    () =>
      Array.isArray(selectedStructure?.assignedStudents)
        ? selectedStructure.assignedStudents.length
        : 0,
    [selectedStructure]
  );

  const generationTargetCount = useMemo(() => {
    if (selectedStudentIds.length) return selectedStudentIds.length;
    if (selectedStructure && structureAssignedCount) return structureAssignedCount;
    return 0;
  }, [selectedStudentIds, selectedStructure, structureAssignedCount]);

  const structurePickerRows = useMemo(() => {
    if (!structurePickerSearch.trim()) return summaryRows;
    const q = structurePickerSearch.toLowerCase();
    return summaryRows.filter((row) =>
      [row.student?.fullName, row.student?.email, row.student?.studentId]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [summaryRows, structurePickerSearch]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllVisibleStudents = () => {
    setSelectedStudentIds((prev) => {
      const merged = new Set(prev);
      pickerRows.forEach((row) => merged.add(row.student._id));
      return Array.from(merged);
    });
  };

  const clearSelectedStudents = () => setSelectedStudentIds([]);

  const toggleStructureStudentSelection = (studentId) => {
    setStructureStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllVisibleStructureStudents = () => {
    setStructureStudentIds((prev) => {
      const merged = new Set(prev);
      structurePickerRows.forEach((row) => merged.add(row.student._id));
      return Array.from(merged);
    });
  };

  const clearStructureStudents = () => setStructureStudentIds([]);

  const startEditStructure = (structure) => {
    setEditingStructureId(structure._id);
    setStructureEditForm({
      title: structure.title || "",
      feeType: structure.feeType || "hostel_fee",
      billingCycle: structure.billingCycle || "monthly",
      amount: structure.amount ?? "",
      dueDay: structure.dueDay ?? 10,
      lateFeeType: structure.lateFeeType || "fixed",
      lateFeeValue: structure.lateFeeValue ?? 0,
      roomLabel: structure.roomLabel || "",
      flowLabel: structure.flowLabel || "",
      description: structure.description || "",
      assignedStudentIds: Array.isArray(structure.assignedStudents)
        ? structure.assignedStudents.map((student) => student._id || student)
        : [],
      isActive: structure.isActive !== false,
    });
  };

  const cancelEditStructure = () => {
    setEditingStructureId("");
  };

  const saveStructureUpdate = async () => {
    const response = await fetch(`${API_BASE}/api/fees/admin/fee-structures/${editingStructureId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        ...structureEditForm,
        amount: Number(structureEditForm.amount),
        dueDay: Number(structureEditForm.dueDay),
        lateFeeValue: Number(structureEditForm.lateFeeValue),
        assignedStudentIds: structureEditForm.assignedStudentIds,
      }),
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to update fee structure.");
    showToast?.("success", "Fee structure updated.");
    setEditingStructureId("");
    loadData();
  };

  const removeStructure = async (id) => {
    const response = await fetch(`${API_BASE}/api/fees/admin/fee-structures/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to remove fee structure.");
    showToast?.("success", "Fee structure removed.");
    if (editingStructureId === id) setEditingStructureId("");
    loadData();
  };

  const startEditBill = (bill) => {
    setEditingBillId(bill._id);
    setBillEditForm({
      title: bill.title || "",
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0, 10) : "",
      baseAmount: bill.baseAmount ?? bill.totalAmount ?? "",
      lateFeeType: bill.lateFeeType || "fixed",
      lateFeeValue: bill.lateFeeValue ?? 0,
      roomLabel: bill.roomLabel || "",
      flowLabel: bill.flowLabel || "",
      description: bill.description || "",
      cancelReason: bill.cancelReason || "",
    });
  };

  const cancelEditBill = () => {
    setEditingBillId("");
  };

  const saveBillUpdate = async (billId, extra = {}) => {
    const response = await fetch(`${API_BASE}/api/fees/admin/bills/${billId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        ...billEditForm,
        baseAmount: Number(billEditForm.baseAmount),
        lateFeeValue: Number(billEditForm.lateFeeValue),
        ...extra,
      }),
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to update bill.");
    showToast?.("success", extra.status === "cancelled" ? "Bill cancelled." : "Bill updated.");
    setEditingBillId("");
    loadData();
  };

  const removeBill = async (billId) => {
    const response = await fetch(`${API_BASE}/api/fees/admin/bills/${billId}`, {
      method: "DELETE",
      headers,
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to delete bill.");
    showToast?.("success", "Bill removed.");
    if (editingBillId === billId) setEditingBillId("");
    loadData();
  };

  const submitStructure = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/api/fees/admin/fee-structures`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...structureForm,
        amount: Number(structureForm.amount),
        dueDay: Number(structureForm.dueDay),
        lateFeeValue: Number(structureForm.lateFeeValue),
        assignedStudentIds: structureStudentIds,
      }),
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to create fee structure.");
    showToast?.("success", "Fee structure created.");
    setStructureForm({
      title: "",
      feeType: "hostel_fee",
      billingCycle: "monthly",
      amount: "",
      dueDay: 10,
      lateFeeType: "fixed",
      lateFeeValue: "250",
      roomLabel: "",
      flowLabel: "",
      description: "",
    });
    clearStructureStudents();
    loadData();
  };

  const generateBills = async (e) => {
    e.preventDefault();
    const selectedStructure = structures.find((item) => item._id === billForm.feeStructureId);
    const structureAssignedIds = Array.isArray(selectedStructure?.assignedStudents)
      ? selectedStructure.assignedStudents.map((student) => student._id || student)
      : [];

    if (!selectedStudentIds.length && !(billForm.feeStructureId && structureAssignedIds.length)) {
      return showToast?.("error", "Select at least one student profile.");
    }
    const payload = billForm.feeStructureId
      ? {
          feeStructureId: billForm.feeStructureId,
          dueDate: billForm.dueDate,
          periodMonth: Number(billForm.periodMonth),
          periodYear: Number(billForm.periodYear),
          ...(selectedStudentIds.length ? { studentIds: selectedStudentIds } : {}),
        }
      : {
          ...billForm,
          amount: Number(billForm.amount),
          periodMonth: Number(billForm.periodMonth),
          periodYear: Number(billForm.periodYear),
          lateFeeValue: Number(billForm.lateFeeValue),
          studentIds: selectedStudentIds,
        };

    const response = await fetch(`${API_BASE}/api/fees/admin/bills/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Bill generation failed.");
    showToast?.("success", data.message || "Bills generated.");
    clearSelectedStudents();
    loadData();
  };

  const lookupStudent = async (studentId) => {
    if (!studentId) return;
    const response = await fetch(`${API_BASE}/api/fees/admin/students/${studentId}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Student lookup failed.");
    setSelectedStudent(data);
  };

  const recordPayment = async (bill) => {
    const amount = Number(paymentForm.amount);
    if (!(amount > 0)) return showToast?.("error", "Amount must be greater than 0.");
    const response = await fetch(`${API_BASE}/api/fees/admin/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...paymentForm,
        studentId: bill.student._id,
        billId: bill._id,
        amount,
      }),
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Payment could not be recorded.");
    showToast?.("success", "Payment recorded successfully.");
    setPaymentForm({
      studentId: "",
      billId: "",
      amount: "",
      paymentMethod: "cash",
      referenceNumber: "",
      cardNumber: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      note: "",
    });
    loadData();
  };

  const removePayment = async (paymentId) => {
    const response = await fetch(`${API_BASE}/api/fees/admin/payments/${paymentId}`, {
      method: "DELETE",
      headers,
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Failed to remove payment entry.");
    showToast?.("success", "Payment entry removed.");
    loadData();
  };

  const sendReminders = async () => {
    const response = await fetch(`${API_BASE}/api/fees/admin/reminders/overdue`, {
      method: "POST",
      headers,
    });
    const data = await response.json();
    if (!response.ok) return showToast?.("error", data.message || "Reminder sending failed.");
    showToast?.("success", data.message || "Reminders sent.");
  };

  const exportReport = async () => {
    const XLSX = await import("xlsx");
    const rows = bills.map((bill) => ({
      StudentID: bill.student?.studentId || "",
      Student: bill.student?.fullName || "",
      Bill: bill.title,
      Type: bill.billType,
      DueDate: fmtDate(bill.dueDate),
      Total: bill.totalAmount,
      Paid: bill.paidAmount,
      Balance: bill.balanceAmount,
      Status: bill.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `fee-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const topMetrics = [
    { label: "Billed", value: compactCurrency(reports?.totals?.totalBilled), fullValue: currency(reports?.totals?.totalBilled) },
    { label: "Collected", value: compactCurrency(reports?.totals?.totalCollected), fullValue: currency(reports?.totals?.totalCollected) },
    { label: "Outstanding", value: compactCurrency(reports?.totals?.totalOutstanding), fullValue: currency(reports?.totals?.totalOutstanding) },
    { label: "Overdue", value: String(reports?.totals?.overdueCount || 0) },
  ];

  const activeBlockOption = BLOCK_OPTIONS.find((item) => item.value === query.block) || BLOCK_OPTIONS[0];
  const billDeskMetrics = [
    { label: "Bills Shown", value: String(bills.length), color: "#f8fafc", bg: "rgba(255,255,255,.03)" },
    { label: "Open Balance", value: compactCurrency(bills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0)), color: "#fca5a5", bg: "rgba(239,68,68,.08)" },
    { label: "Collected", value: compactCurrency(bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0)), color: "#a7f3d0", bg: "rgba(16,185,129,.1)" },
    { label: "Overdue Bills", value: String(bills.filter((bill) => bill.status === "overdue").length), color: "#fde68a", bg: "rgba(245,158,11,.12)" },
  ];

  if (loading) {
    return (
      <div style={{ padding: 28, color: "#f8fafc", fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800 }}>
        Loading fee management...
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ ...cardStyle, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#f8fafc" }}>
              Fee & Payment Management
            </div>
            <div style={{ marginTop: 6, color: "rgba(248,250,252,.45)" }}>
              Create fee structures, generate bills, track balances, and record payments.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={query.search} onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value }))} placeholder="Search student or bill..." style={{ ...inputStyle, width: 220 }} />
            <button onClick={() => loadData()} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontWeight: 700, cursor: "pointer" }}>
              Refresh
            </button>
            <button onClick={sendReminders} style={{ padding: "12px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#271400", fontWeight: 800, cursor: "pointer" }}>
              Send Overdue Reminders
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginTop: 20 }}>
          {topMetrics.map((item) => (
            <div key={item.label} style={{ borderRadius: 18, background: "linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.05)", padding: 16, minHeight: 94, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: "rgba(248,250,252,.38)", textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</div>
              <div title={item.fullValue || item.value} style={metricValueStyle}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>Select Block</div>
            <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
              Click a block to view its current residents and payment totals based on confirmed room bookings.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
            {BLOCK_OPTIONS.map((block) => {
              const selected = query.block === block.value;
              return (
                <button
                  key={block.value}
                  type="button"
                  onClick={() => setQuery((prev) => ({ ...prev, block: block.value }))}
                  style={{
                    padding: "18px 16px",
                    borderRadius: 18,
                    border: selected ? `1px solid ${block.accent}` : "1px solid rgba(255,255,255,.06)",
                    background: selected ? block.bg : "rgba(255,255,255,.03)",
                    color: "#f8fafc",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: selected ? `0 12px 28px ${block.bg}` : "none",
                  }}
                >
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800 }}>{block.label}</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: selected ? block.accent : "rgba(248,250,252,.42)" }}>
                    {block.value === "all" ? "Global fee view" : "Current residents only"}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ borderRadius: 18, padding: 18, background: activeBlockOption.bg, border: `1px solid ${activeBlockOption.accent}33` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
                  {activeBlockOption.label} Summary
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: activeBlockOption.accent }}>
                  Resident-based totals from confirmed room bookings.
                </div>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(15,23,42,.35)", color: "#f8fafc", fontWeight: 700, fontSize: 12 }}>
                {blockSummary?.totalStudents || 0} student{(blockSummary?.totalStudents || 0) === 1 ? "" : "s"}
              </div>
            </div>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 14, background: "rgba(15,23,42,.28)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.44)", textTransform: "uppercase", letterSpacing: ".08em" }}>Students</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{blockSummary?.totalStudents || 0}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: "rgba(15,23,42,.28)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.44)", textTransform: "uppercase", letterSpacing: ".08em" }}>Billed</div>
                <div title={currency(blockSummary?.totalBilled)} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18 }}>{compactCurrency(blockSummary?.totalBilled)}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: "rgba(16,185,129,.14)" }}>
                <div style={{ fontSize: 11, color: "rgba(167,243,208,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Paid</div>
                <div title={currency(blockSummary?.totalPaid)} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: "#a7f3d0" }}>{compactCurrency(blockSummary?.totalPaid)}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: "rgba(239,68,68,.12)" }}>
                <div style={{ fontSize: 11, color: "rgba(252,165,165,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Balance</div>
                <div title={currency(blockSummary?.totalOutstanding)} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: "#fca5a5" }}>{compactCurrency(blockSummary?.totalOutstanding)}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: "rgba(245,158,11,.12)" }}>
                <div style={{ fontSize: 11, color: "rgba(253,224,71,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Overdue</div>
                <div style={{ marginTop: 6, color: "#fde68a", fontWeight: 800 }}>{blockSummary?.overdueCount || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <form onSubmit={submitStructure} style={{ ...cardStyle, padding: 20, display: "grid", gap: 12 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Create Fee Structure</div>
          <input value={structureForm.title} onChange={(e) => setStructureForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Structure title" style={inputStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <select value={structureForm.feeType} onChange={(e) => setStructureForm((prev) => ({ ...prev, feeType: e.target.value }))} style={inputStyle}>
              {BILL_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={structureForm.billingCycle} onChange={(e) => setStructureForm((prev) => ({ ...prev, billingCycle: e.target.value }))} style={inputStyle}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One Time</option>
            </select>
            <input type="number" min="0" step="0.01" value={structureForm.amount} onChange={(e) => setStructureForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Amount" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <input type="number" min="1" max="31" value={structureForm.dueDay} onChange={(e) => setStructureForm((prev) => ({ ...prev, dueDay: e.target.value }))} placeholder="Due day" style={inputStyle} />
            <select value={structureForm.lateFeeType} onChange={(e) => setStructureForm((prev) => ({ ...prev, lateFeeType: e.target.value }))} style={inputStyle}>
              <option value="none">No late fee</option>
              <option value="fixed">Fixed late fee</option>
              <option value="percentage">Percentage late fee</option>
            </select>
            <input type="number" min="0" step="0.01" value={structureForm.lateFeeValue} onChange={(e) => setStructureForm((prev) => ({ ...prev, lateFeeValue: e.target.value }))} placeholder="Late fee value" style={inputStyle} />
          </div>
          <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>Assign Fee Structure to Profiles</div>
                <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                  Select users one by one. This structure will belong to the selected profiles.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={structurePickerSearch}
                  onChange={(e) => setStructurePickerSearch(e.target.value)}
                  placeholder="Search profile..."
                  style={{ ...inputStyle, width: 180, padding: "9px 12px" }}
                />
                <button
                  type="button"
                  onClick={selectAllVisibleStructureStudents}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontWeight: 700, cursor: "pointer" }}
                >
                  Select Visible
                </button>
                <button
                  type="button"
                  onClick={clearStructureStudents}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.08)", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {structureStudentIds.length ? (
                structureStudentIds.map((id) => {
                  const row = summaryRows.find((item) => item.student._id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        borderRadius: 999,
                        background: "rgba(16,185,129,.12)",
                        border: "1px solid rgba(16,185,129,.25)",
                        color: "#a7f3d0",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {row?.student?.studentId || id}
                      <button
                        type="button"
                        onClick={() => toggleStructureStudentSelection(id)}
                        style={{ background: "transparent", border: "none", color: "#a7f3d0", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <span style={{ color: "rgba(248,250,252,.35)", fontSize: 12 }}>
                  No profile assigned yet.
                </span>
              )}
            </div>

            <div style={{ marginTop: 14, maxHeight: 220, overflowY: "auto", display: "grid", gap: 8 }}>
              {structurePickerRows.map((row) => {
                const checked = structureStudentIds.includes(row.student._id);
                return (
                  <label
                    key={row.student._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "11px 12px",
                      borderRadius: 12,
                      border: checked ? "1px solid rgba(16,185,129,.28)" : "1px solid rgba(255,255,255,.05)",
                      background: checked ? "rgba(16,185,129,.08)" : "rgba(255,255,255,.02)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStructureStudentSelection(row.student._id)}
                      />
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>{row.student.fullName}</div>
                        <div style={{ marginTop: 3, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                          {row.student.studentId} • {row.student.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: row.remainingBalance > 0 ? "#fca5a5" : "#86efac", fontWeight: 800, fontSize: 13 }}>
                      {currency(row.remainingBalance)}
                    </div>
                  </label>
                );
              })}
              {!structurePickerRows.length && (
                <div style={{ padding: 12, color: "rgba(248,250,252,.35)", textAlign: "center" }}>
                  No profiles match this search.
                </div>
              )}
            </div>
          </div>
          <textarea value={structureForm.description} onChange={(e) => setStructureForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Description" style={{ ...inputStyle, resize: "vertical" }} />
          <button type="submit" style={{ padding: "12px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
            Save Fee Structure
          </button>
        </form>

        <form onSubmit={generateBills} style={{ ...cardStyle, padding: 20, display: "grid", gap: 12 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Generate Bills</div>
          <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
            <div style={{ color: "#f8fafc", fontWeight: 700 }}>Billing Workflow</div>
            <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
              1. Pick a fee structure or manual bill. 2. Set the billing period. 3. Select recipients. 4. Review totals and generate.
            </div>
          </div>
          <select value={billForm.feeStructureId} onChange={(e) => setBillForm((prev) => ({ ...prev, feeStructureId: e.target.value }))} style={inputStyle}>
            <option value="">Manual bill</option>
            {structures.map((structure) => (
              <option key={structure._id} value={structure._id}>{structure.title} • {currency(structure.amount)}</option>
            ))}
          </select>
          {selectedStructure && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(99,102,241,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(199,210,254,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Template</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{selectedStructure.title}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(16,185,129,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(167,243,208,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Amount</div>
                <div title={currency(selectedStructure.amount)} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: "#a7f3d0" }}>{compactCurrency(selectedStructure.amount)}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(245,158,11,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(253,224,71,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Due Rule</div>
                <div style={{ marginTop: 6, color: "#fde68a", fontWeight: 800 }}>Day {selectedStructure.dueDay || 10}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.03)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Assigned Users</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{structureAssignedCount || "All active"}</div>
              </div>
            </div>
          )}
          {!billForm.feeStructureId && (
            <>
              <input value={billForm.title} onChange={(e) => setBillForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Bill title" style={inputStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                <select value={billForm.billType} onChange={(e) => setBillForm((prev) => ({ ...prev, billType: e.target.value }))} style={inputStyle}>
                  {BILL_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <select value={billForm.billingCycle} onChange={(e) => setBillForm((prev) => ({ ...prev, billingCycle: e.target.value }))} style={inputStyle}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one_time">One Time</option>
                </select>
                <input type="number" min="0" step="0.01" value={billForm.amount} onChange={(e) => setBillForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Amount" style={inputStyle} />
              </div>
            </>
          )}
          <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", display: "grid", gap: 12 }}>
            <div>
              <div style={{ color: "#f8fafc", fontWeight: 700 }}>Billing Period & Due Date</div>
              <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                Define the exact posting period so duplicate bills are blocked and monthly reporting stays accurate.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              <input type="date" value={billForm.dueDate} onChange={(e) => setBillForm((prev) => ({ ...prev, dueDate: e.target.value }))} style={inputStyle} />
              <input type="number" min="1" max="12" value={billForm.periodMonth} onChange={(e) => setBillForm((prev) => ({ ...prev, periodMonth: e.target.value }))} placeholder="Month" style={inputStyle} />
              <input type="number" value={billForm.periodYear} onChange={(e) => setBillForm((prev) => ({ ...prev, periodYear: e.target.value }))} placeholder="Year" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Bill Mode</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{selectedStructure ? "Fee Structure" : "Manual Bill"}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Cycle</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{selectedStructure?.billingCycle || billForm.billingCycle}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Posting Period</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{String(billForm.periodMonth).padStart(2, "0")}/{billForm.periodYear}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Due Date</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>{billForm.dueDate ? fmtDate(billForm.dueDate) : "Set before posting"}</div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>Select Billing Targets</div>
                <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                  Choose users one by one or use the recipients already assigned to the selected fee structure.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={studentPickerSearch}
                  onChange={(e) => setStudentPickerSearch(e.target.value)}
                  placeholder="Search profile..."
                  style={{ ...inputStyle, width: 180, padding: "9px 12px" }}
                />
                <button
                  type="button"
                  onClick={selectAllVisibleStudents}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontWeight: 700, cursor: "pointer" }}
                >
                  Select Visible
                </button>
                <button
                  type="button"
                  onClick={clearSelectedStudents}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.08)", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(99,102,241,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(199,210,254,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Target Students</div>
                <div style={{ marginTop: 6, color: "#c7d2fe", fontWeight: 800 }}>{generationTargetCount || 0}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(16,185,129,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(167,243,208,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Per Student</div>
                <div title={currency(selectedStructure?.amount || billForm.amount)} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: "#a7f3d0" }}>{compactCurrency(selectedStructure?.amount || billForm.amount)}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(245,158,11,.08)" }}>
                <div style={{ fontSize: 11, color: "rgba(253,224,71,.8)", textTransform: "uppercase", letterSpacing: ".08em" }}>Projected Billing</div>
                <div title={currency((selectedStructure?.amount || Number(billForm.amount) || 0) * (generationTargetCount || 0))} style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: "#fde68a" }}>{compactCurrency((selectedStructure?.amount || Number(billForm.amount) || 0) * (generationTargetCount || 0))}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.03)" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Recipient Source</div>
                <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 800 }}>
                  {selectedStudentIds.length ? "Manual selection" : selectedStructure && structureAssignedCount ? "Assigned users" : "No targets yet"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedStudentIds.length ? (
                selectedStudentIds.map((id) => {
                  const row = summaryRows.find((item) => item.student._id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        borderRadius: 999,
                        background: "rgba(99,102,241,.12)",
                        border: "1px solid rgba(99,102,241,.25)",
                        color: "#c7d2fe",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {row?.student?.studentId || id}
                      <button
                        type="button"
                        onClick={() => toggleStudentSelection(id)}
                        style={{ background: "transparent", border: "none", color: "#c7d2fe", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <span style={{ color: "rgba(248,250,252,.35)", fontSize: 12 }}>
                  No student selected yet.
                </span>
              )}
            </div>

            <div style={{ marginTop: 14, maxHeight: 240, overflowY: "auto", display: "grid", gap: 8 }}>
              {pickerRows.map((row) => {
                const checked = selectedStudentIds.includes(row.student._id);
                return (
                  <label
                    key={row.student._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "11px 12px",
                      borderRadius: 12,
                      border: checked ? "1px solid rgba(99,102,241,.28)" : "1px solid rgba(255,255,255,.05)",
                      background: checked ? "rgba(99,102,241,.08)" : "rgba(255,255,255,.02)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentSelection(row.student._id)}
                      />
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>{row.student.fullName}</div>
                        <div style={{ marginTop: 3, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                          {row.student.studentId} • {row.student.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: row.remainingBalance > 0 ? "#fca5a5" : "#86efac", fontWeight: 800, fontSize: 13 }}>
                      {currency(row.remainingBalance)}
                    </div>
                  </label>
                );
              })}
              {!pickerRows.length && (
                <div style={{ padding: 12, color: "rgba(248,250,252,.35)", textAlign: "center" }}>
                  No profiles match this search.
                </div>
              )}
            </div>
          </div>
          <button type="submit" style={{ padding: "14px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#34d399)", color: "#04130d", fontWeight: 800, cursor: "pointer" }}>
            {selectedStructure ? "Generate Bills From Fee Structure" : "Generate Manual Bills"}
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 20 }}>
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Manage Fee Structures</div>
            <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
              Update fee amounts, due dates, penalties, and assigned users one by one.
            </div>
          </div>
          <div style={{ padding: 18, display: "grid", gap: 12 }}>
            {structures.map((structure) => {
              const assignedIds =
                editingStructureId === structure._id
                  ? structureEditForm.assignedStudentIds
                  : Array.isArray(structure.assignedStudents)
                    ? structure.assignedStudents.map((student) => student._id || student)
                    : [];

              return (
                <div key={structure._id} style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: "#f8fafc", fontWeight: 700 }}>{structure.title}</div>
                      <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                        {BILL_TYPES.find((item) => item.value === structure.feeType)?.label || structure.feeType} • {structure.billingCycle} • Due day {structure.dueDay}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: structure.isActive === false ? "rgba(239,68,68,.12)" : "rgba(16,185,129,.12)", color: structure.isActive === false ? "#fca5a5" : "#a7f3d0", fontSize: 12, fontWeight: 700 }}>
                        {structure.isActive === false ? "Inactive" : "Active"}
                      </span>
                      <span style={{ color: "#c7d2fe", fontWeight: 800 }}>{currency(structure.amount)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {assignedIds.length ? (
                      assignedIds.slice(0, 6).map((id) => {
                        const row = summaryRows.find((item) => item.student._id === id || item.student.studentId === id);
                        return (
                          <span key={id} style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)", color: "#c7d2fe", fontSize: 12, fontWeight: 700 }}>
                            {row?.student?.studentId || id}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ color: "rgba(248,250,252,.35)", fontSize: 12 }}>No specific user assigned. This structure can be used broadly.</span>
                    )}
                    {assignedIds.length > 6 && (
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.04)", color: "rgba(248,250,252,.62)", fontSize: 12, fontWeight: 700 }}>
                        +{assignedIds.length - 6} more
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => startEditStructure(structure)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(99,102,241,.22)", background: "rgba(99,102,241,.08)", color: "#c7d2fe", fontWeight: 700, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeStructure(structure._id)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.08)", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>

                  {editingStructureId === structure._id && (
                    <div style={{ marginTop: 16, display: "grid", gap: 12, padding: 14, borderRadius: 16, background: "rgba(15,23,42,.35)", border: "1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
                        <input value={structureEditForm.title} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" style={inputStyle} />
                        <select value={structureEditForm.feeType} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, feeType: e.target.value }))} style={inputStyle}>
                          {BILL_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                        <select value={structureEditForm.billingCycle} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, billingCycle: e.target.value }))} style={inputStyle}>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="one_time">One Time</option>
                        </select>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                        <input type="number" min="0" step="0.01" value={structureEditForm.amount} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Amount" style={inputStyle} />
                        <input type="number" min="1" max="31" value={structureEditForm.dueDay} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, dueDay: e.target.value }))} placeholder="Due day" style={inputStyle} />
                        <select value={structureEditForm.lateFeeType} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, lateFeeType: e.target.value }))} style={inputStyle}>
                          <option value="none">No late fee</option>
                          <option value="fixed">Fixed late fee</option>
                          <option value="percentage">Percentage late fee</option>
                        </select>
                        <input type="number" min="0" step="0.01" value={structureEditForm.lateFeeValue} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, lateFeeValue: e.target.value }))} placeholder="Late fee value" style={inputStyle} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input value={structureEditForm.roomLabel} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, roomLabel: e.target.value }))} placeholder="Room label" style={inputStyle} />
                        <input value={structureEditForm.flowLabel} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, flowLabel: e.target.value }))} placeholder="Flow label" style={inputStyle} />
                      </div>
                      <textarea value={structureEditForm.description} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Description" style={{ ...inputStyle, resize: "vertical" }} />
                      <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#f8fafc", fontWeight: 700 }}>
                        <input type="checkbox" checked={structureEditForm.isActive} onChange={(e) => setStructureEditForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                        Active fee structure
                      </label>
                      <div style={{ display: "grid", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                        {summaryRows.map((row) => {
                          const checked = structureEditForm.assignedStudentIds.includes(row.student._id);
                          return (
                            <label key={row.student._id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 12, border: checked ? "1px solid rgba(16,185,129,.28)" : "1px solid rgba(255,255,255,.05)", background: checked ? "rgba(16,185,129,.08)" : "rgba(255,255,255,.02)", cursor: "pointer" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setStructureEditForm((prev) => ({
                                      ...prev,
                                      assignedStudentIds: checked
                                        ? prev.assignedStudentIds.filter((id) => id !== row.student._id)
                                        : [...prev.assignedStudentIds, row.student._id],
                                    }))
                                  }
                                />
                                <div>
                                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>{row.student.fullName}</div>
                                  <div style={{ marginTop: 3, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{row.student.studentId} • {row.student.email}</div>
                                </div>
                              </div>
                              <div style={{ color: row.remainingBalance > 0 ? "#fca5a5" : "#86efac", fontWeight: 800, fontSize: 13 }}>
                                {currency(row.remainingBalance)}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" onClick={saveStructureUpdate} style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#34d399)", color: "#04130d", fontWeight: 800, cursor: "pointer" }}>
                          Save Changes
                        </button>
                        <button type="button" onClick={cancelEditStructure} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontWeight: 700, cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Reports by Bill Type</div>
              <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                Paid, outstanding, hostel fee, water, electricity, and other income in one place.
              </div>
            </div>
            <div style={{ padding: 18, display: "grid", gap: 10 }}>
              {(reports?.byType || []).map((row) => (
                <div key={row.type} style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 700 }}>{BILL_TYPES.find((item) => item.value === row.type)?.label || row.type}</div>
                    <div style={{ color: "#c7d2fe", fontWeight: 800 }}>{currency(row.total)}</div>
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 14, background: "rgba(16,185,129,.1)", color: "#a7f3d0" }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Paid</div>
                      <div style={{ marginTop: 4, fontWeight: 800 }}>{currency(row.paid)}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 14, background: "rgba(239,68,68,.08)", color: "#fca5a5" }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Balance</div>
                      <div style={{ marginTop: 4, fontWeight: 800 }}>{currency(row.balance)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Collections Timeline</div>
              <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                Monthly and annual fee collection totals based on successful payments.
              </div>
            </div>
            <div style={{ padding: 18, display: "grid", gap: 10 }}>
              {(reports?.monthlyCollections || []).length ? (
                reports.monthlyCollections.map((item) => (
                  <div key={item.period} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 700 }}>{item.period}</div>
                    <div style={{ color: "#86efac", fontWeight: 800 }}>{currency(item.amount)}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(248,250,252,.42)" }}>No successful payments collected yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 20 }}>
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Student Financial Summary</div>
              <div style={{ color: "rgba(248,250,252,.42)", fontSize: 12 }}>Search by unique ID or click a row to inspect details.</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={query.block} onChange={(e) => setQuery((prev) => ({ ...prev, block: e.target.value }))} style={inputStyle}>
                {BLOCK_OPTIONS.map((block) => (
                  <option key={block.value} value={block.value}>{block.label}</option>
                ))}
              </select>
              <select value={query.status} onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value }))} style={inputStyle}>
                <option value="all">All students</option>
                <option value="paid">Fully paid</option>
                <option value="unpaid">Outstanding</option>
                <option value="overdue">Overdue</option>
              </select>
              <button onClick={exportReport} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(99,102,241,.22)", background: "rgba(99,102,241,.08)", color: "#c7d2fe", fontWeight: 800, cursor: "pointer" }}>
                Export Report
              </button>
            </div>
          </div>
          <div style={{ padding: 18, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ color: "#f8fafc", fontWeight: 700 }}>Active Filter: {activeBlockOption.label}</div>
              <div style={{ color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                {blockSummary?.totalStudents || 0} resident{(blockSummary?.totalStudents || 0) === 1 ? "" : "s"} in summary
              </div>
            </div>
            {filteredRows.map((row) => (
              <button key={row.student._id} onClick={() => lookupStudent(row.student.studentId || row.student._id)} style={{ textAlign: "left", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 16, padding: 14, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontWeight: 700 }}>{row.student.fullName}</div>
                    {row.block && (
                      <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "rgba(99,102,241,.12)", color: "#c7d2fe", fontSize: 12, fontWeight: 700 }}>
                        Block {row.block}{row.roomNumber ? ` | Room ${row.roomNumber}` : ""}
                      </div>
                    )}
                    <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{row.student.studentId} • {row.student.email}</div>
                  </div>
                  <div style={{ color: row.overdueBills > 0 ? "#fca5a5" : "#86efac", fontWeight: 800 }}>
                    {currency(row.remainingBalance)}
                  </div>
                </div>
              </button>
            ))}
            {!filteredRows.length && (
              <div style={{ padding: 18, borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "rgba(248,250,252,.42)", textAlign: "center" }}>
                {query.block === "all" ? "No students match this search." : `No confirmed residents found for ${activeBlockOption.label}.`}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Student Lookup</div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <input value={query.search} onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value }))} placeholder="Enter student ID..." style={inputStyle} />
            <button onClick={() => lookupStudent(query.search)} style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Search
            </button>
          </div>
          {selectedStudent ? (
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>{selectedStudent.student.fullName}</div>
                <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{selectedStudent.student.studentId} • {selectedStudent.student.email}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.03)" }}><div style={{ color: "rgba(248,250,252,.42)", fontSize: 12 }}>Total Fee</div><div style={{ color: "#f8fafc", fontWeight: 800 }}>{currency(selectedStudent.totals.totalFees)}</div></div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.03)" }}><div style={{ color: "rgba(248,250,252,.42)", fontSize: 12 }}>Balance</div><div style={{ color: "#fca5a5", fontWeight: 800 }}>{currency(selectedStudent.totals.remainingBalance)}</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(16,185,129,.08)" }}><div style={{ color: "rgba(167,243,208,.8)", fontSize: 12 }}>Collected</div><div style={{ color: "#a7f3d0", fontWeight: 800 }}>{currency(selectedStudent.totals.totalPaid)}</div></div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(239,68,68,.08)" }}><div style={{ color: "rgba(252,165,165,.8)", fontSize: 12 }}>Overdue Bills</div><div style={{ color: "#fca5a5", fontWeight: 800 }}>{selectedStudent.totals.overdueBills}</div></div>
              </div>
              <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>Recent Bills</div>
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {(selectedStudent.bills || []).slice(0, 4).map((bill) => (
                    <div key={bill._id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.02)" }}>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 13 }}>{bill.title}</div>
                        <div style={{ marginTop: 3, color: "rgba(248,250,252,.42)", fontSize: 12 }}>Due {fmtDate(bill.dueDate)} | {bill.status}</div>
                      </div>
                      <div style={{ color: bill.balanceAmount > 0 ? "#fca5a5" : "#86efac", fontWeight: 800 }}>{currency(bill.balanceAmount)}</div>
                    </div>
                  ))}
                  {!selectedStudent.bills?.length && <div style={{ color: "rgba(248,250,252,.42)" }}>No bills found for this student.</div>}
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>Recent Payments</div>
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {(selectedStudent.payments || []).slice(0, 4).map((payment) => (
                    <div key={payment._id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.02)" }}>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 13 }}>{payment.paymentMethod} payment</div>
                        <div style={{ marginTop: 3, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{fmtDate(payment.paymentDate)} | {payment.status}</div>
                      </div>
                      <div style={{ color: payment.status === "success" ? "#86efac" : "#facc15", fontWeight: 800 }}>{currency(payment.amount)}</div>
                    </div>
                  ))}
                  {!selectedStudent.payments?.length && <div style={{ color: "rgba(248,250,252,.42)" }}>No payments recorded yet.</div>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, color: "rgba(248,250,252,.42)" }}>Search a student ID to view the full payment summary.</div>
          )}
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Bill Management</div>
            <div style={{ color: "rgba(248,250,252,.42)", fontSize: 12 }}>Operations desk for reviewing bills, updating records, and posting collections.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={query.block} onChange={(e) => setQuery((prev) => ({ ...prev, block: e.target.value }))} style={inputStyle}>
              {BLOCK_OPTIONS.map((block) => (
                <option key={block.value} value={block.value}>{block.label}</option>
              ))}
            </select>
            <select value={query.billStatus} onChange={(e) => setQuery((prev) => ({ ...prev, billStatus: e.target.value }))} style={inputStyle}>
              <option value="all">All bill statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div style={{ padding: 18, display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
            {billDeskMetrics.map((item) => (
              <div key={item.label} style={{ padding: 14, borderRadius: 16, background: item.bg, border: "1px solid rgba(255,255,255,.05)", minHeight: 88, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</div>
                <div style={{ ...metricValueStyle, marginTop: 6, fontSize: 18, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr 1fr 1fr 1fr 1.15fr", gap: 12, padding: "14px 16px", borderRadius: 16, background: "rgba(15,23,42,.45)", border: "1px solid rgba(255,255,255,.06)", fontSize: 11, color: "rgba(248,250,252,.44)", textTransform: "uppercase", letterSpacing: ".08em" }}>
            <div>Bill & Student</div>
            <div>Type / Period</div>
            <div>Due Date</div>
            <div>Amounts</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
          {bills.slice(0, 12).map((bill) => (
            <div key={bill._id} style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>{bill.title}</div>
                  <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{bill.student?.fullName} • {bill.student?.studentId} • Due {fmtDate(bill.dueDate)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: bill.status === "paid" ? "rgba(16,185,129,.12)" : bill.status === "cancelled" ? "rgba(148,163,184,.12)" : "rgba(239,68,68,.08)", color: bill.status === "paid" ? "#a7f3d0" : bill.status === "cancelled" ? "#cbd5e1" : "#fca5a5", fontSize: 12, fontWeight: 700 }}>
                    {bill.status}
                  </span>
                  <div style={{ color: bill.status === "paid" ? "#86efac" : "#fca5a5", fontWeight: 800 }}>{currency(bill.balanceAmount)}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Type / Period</div>
                  <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 700, fontSize: 13 }}>
                    {BILL_TYPES.find((item) => item.value === bill.billType)?.label || bill.billType}
                  </div>
                  <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                    {bill.billingCycle} {bill.periodMonth ? `• ${String(bill.periodMonth).padStart(2, "0")}` : ""} {bill.periodYear || ""}
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Amounts</div>
                  <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 700, fontSize: 13 }}>Total {currency(bill.totalAmount)}</div>
                  <div style={{ marginTop: 4, color: "#a7f3d0", fontSize: 12 }}>Paid {currency(bill.paidAmount)}</div>
                  <div style={{ marginTop: 4, color: "#fca5a5", fontSize: 12 }}>Balance {currency(bill.balanceAmount)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Penalty / Labels</div>
                  <div style={{ marginTop: 6, color: bill.lateFeeAmount > 0 ? "#fde68a" : "#f8fafc", fontWeight: 700, fontSize: 13 }}>
                    {bill.lateFeeAmount > 0 ? `Late ${currency(bill.lateFeeAmount)}` : "No late fee"}
                  </div>
                  <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>{bill.roomLabel || bill.flowLabel || "No room / flow label"}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.025)" }}>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,.42)", textTransform: "uppercase", letterSpacing: ".08em" }}>Controls</div>
                  <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 700, fontSize: 13 }}>{bill.status === "paid" ? "Closed" : "Action required"}</div>
                  <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>Created by {bill.createdBy || "admin"}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {bill.status !== "paid" && bill.status !== "cancelled" && (
                  <button type="button" onClick={() => startEditBill(bill)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(99,102,241,.22)", background: "rgba(99,102,241,.08)", color: "#c7d2fe", fontWeight: 700, cursor: "pointer" }}>
                    Edit Bill
                  </button>
                )}
                {bill.status !== "paid" && bill.status !== "cancelled" && (
                  <button type="button" onClick={() => startEditBill(bill)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(245,158,11,.18)", background: "rgba(245,158,11,.08)", color: "#fcd34d", fontWeight: 700, cursor: "pointer" }}>
                    Cancel Bill
                  </button>
                )}
                <button type="button" onClick={() => removeBill(bill._id)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.08)", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}>
                  Delete Bill
                </button>
              </div>
              {editingBillId === bill._id && (
                <div style={{ marginTop: 14, display: "grid", gap: 10, padding: 14, borderRadius: 16, background: "rgba(15,23,42,.35)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>Update Bill Record</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 10 }}>
                    <input value={billEditForm.title} onChange={(e) => setBillEditForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Bill title" style={inputStyle} />
                    <input type="date" value={billEditForm.dueDate} onChange={(e) => setBillEditForm((prev) => ({ ...prev, dueDate: e.target.value }))} style={inputStyle} />
                    <input type="number" min="0" step="0.01" value={billEditForm.baseAmount} onChange={(e) => setBillEditForm((prev) => ({ ...prev, baseAmount: e.target.value }))} placeholder="Amount" style={inputStyle} />
                    <select value={billEditForm.lateFeeType} onChange={(e) => setBillEditForm((prev) => ({ ...prev, lateFeeType: e.target.value }))} style={inputStyle}>
                      <option value="none">No late fee</option>
                      <option value="fixed">Fixed late fee</option>
                      <option value="percentage">Percentage late fee</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <input type="number" min="0" step="0.01" value={billEditForm.lateFeeValue} onChange={(e) => setBillEditForm((prev) => ({ ...prev, lateFeeValue: e.target.value }))} placeholder="Late fee value" style={inputStyle} />
                    <input value={billEditForm.roomLabel} onChange={(e) => setBillEditForm((prev) => ({ ...prev, roomLabel: e.target.value }))} placeholder="Room label" style={inputStyle} />
                    <input value={billEditForm.flowLabel} onChange={(e) => setBillEditForm((prev) => ({ ...prev, flowLabel: e.target.value }))} placeholder="Flow label" style={inputStyle} />
                  </div>
                  <textarea value={billEditForm.description} onChange={(e) => setBillEditForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Description" style={{ ...inputStyle, resize: "vertical" }} />
                  <input value={billEditForm.cancelReason} onChange={(e) => setBillEditForm((prev) => ({ ...prev, cancelReason: e.target.value }))} placeholder="Cancel reason if needed" style={inputStyle} />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => saveBillUpdate(bill._id)} style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#34d399)", color: "#04130d", fontWeight: 800, cursor: "pointer" }}>
                      Save Bill
                    </button>
                    <button type="button" onClick={() => saveBillUpdate(bill._id, { status: "cancelled" })} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(245,158,11,.18)", background: "rgba(245,158,11,.08)", color: "#fcd34d", fontWeight: 700, cursor: "pointer" }}>
                      Mark Cancelled
                    </button>
                    <button type="button" onClick={cancelEditBill} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontWeight: 700, cursor: "pointer" }}>
                      Close
                    </button>
                  </div>
                </div>
              )}
              {bill.status !== "paid" && bill.status !== "cancelled" && (
                <div style={{ marginTop: 12, display: "grid", gap: 10, padding: 14, borderRadius: 16, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>Post Payment / Collection</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr)) auto", gap: 10 }}>
                  <input value={paymentForm.billId === bill._id ? paymentForm.amount : ""} onChange={(e) => setPaymentForm((prev) => ({ ...prev, billId: bill._id, amount: e.target.value }))} placeholder="Amount received" type="number" min="0" step="0.01" style={inputStyle} />
                  <select value={paymentForm.billId === bill._id ? paymentForm.paymentMethod : "cash"} onChange={(e) => setPaymentForm((prev) => ({ ...prev, billId: bill._id, paymentMethod: e.target.value }))} style={inputStyle}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                  <input value={paymentForm.billId === bill._id ? paymentForm.referenceNumber : ""} onChange={(e) => setPaymentForm((prev) => ({ ...prev, billId: bill._id, referenceNumber: e.target.value }))} placeholder="Receipt / reference" style={inputStyle} />
                  <input value={paymentForm.billId === bill._id ? paymentForm.cardNumber : ""} onChange={(e) => setPaymentForm((prev) => ({ ...prev, billId: bill._id, cardNumber: e.target.value }))} placeholder="Card (optional)" style={inputStyle} />
                  <input type="date" value={paymentForm.billId === bill._id ? paymentForm.paymentDate : new Date().toISOString().slice(0, 10)} onChange={(e) => setPaymentForm((prev) => ({ ...prev, billId: bill._id, paymentDate: e.target.value }))} style={inputStyle} />
                  <button onClick={() => recordPayment(bill)} style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#10b981,#34d399)", color: "#04130d", fontWeight: 800, cursor: "pointer" }}>
                    Record
                  </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>Payment Entry Cleanup</div>
          <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
            Delete incorrect or duplicate payment records. Successful-payment removal will restore the bill balance.
          </div>
        </div>
        <div style={{ padding: 18, display: "grid", gap: 10 }}>
          {(reports?.payments || []).slice(0, 12).map((payment) => (
            <div key={payment._id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: 14, borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 700 }}>
                  {payment.student?.fullName || "Unknown student"} • {currency(payment.amount)}
                </div>
                <div style={{ marginTop: 4, color: "rgba(248,250,252,.42)", fontSize: 12 }}>
                  {payment.student?.studentId || "-"} • {payment.paymentMethod} • {payment.status} • {fmtDate(payment.paymentDate)}
                </div>
              </div>
              <button type="button" onClick={() => removePayment(payment._id)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.08)", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}>
                Delete Entry
              </button>
            </div>
          ))}
          {!reports?.payments?.length && <div style={{ color: "rgba(248,250,252,.42)" }}>No payment entries available.</div>}
        </div>
      </div>
    </div>
  );
}
