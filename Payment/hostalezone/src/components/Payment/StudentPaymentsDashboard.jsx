import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  FileUp,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  getStudentPaymentSummary,
  initiatePayment,
  verifyPayment,
} from "../../api/paymentApi";
import {
  formatCurrency,
  formatDisplayDate,
  getBillStatusClasses,
  getGradientByIndex,
  getPaymentStatusClasses,
} from "./paymentUtils";

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

const initialPaymentForm = {
  paymentMethod: "Card",
  referenceNumber: "",
  transactionReference: "",
  receiptUrl: "",
  receiptFileName: "",
  cardNetwork: "Visa",
  cardHolderName: "",
  cardNumber: "",
  cardExpiryMonth: "",
  cardExpiryYear: "",
  cardCvv: "",
  notes: "",
};

function getSubmitButtonLabel(submitting, isCardPayment) {
  if (submitting) {
    return isCardPayment ? "Sending OTP..." : "Submitting...";
  }

  return isCardPayment ? "Send OTP & Continue" : "Submit For Admin Review";
}

function normalizePaymentStatus(payment) {
  if (!payment) {
    return "pending";
  }

  if (payment.paymentMethod !== "Card" && payment.status === "otp_sent") {
    return "pending";
  }

  return payment.status || "pending";
}

const StudentPaymentsDashboard = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [otpCode, setOtpCode] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpTargetPayment, setOtpTargetPayment] = useState(null);
  const [slipPreviewOpen, setSlipPreviewOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadPaymentDashboard = async () => {
    setLoading(true);
    try {
      const response = await getStudentPaymentSummary("me");
      setSummaryData(response.data);
    } catch (error) {
      console.error("Failed to load student payment summary:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to load payment details right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.email && !user?.id && !user?._id && !user?.itNumber) {
      navigate("/SignIn");
      return;
    }

    loadPaymentDashboard();
  }, [navigate, user?.email, user?.id, user?._id, user?.itNumber]);

  const currentBill = summaryData?.currentBill;
  const summary = summaryData?.summary;
  const recentPayments = useMemo(() => summaryData?.recentPayments || [], [
    summaryData?.recentPayments,
  ]);
  const billHistory = summaryData?.bills || [];

  const pendingOtpPayments = useMemo(
    () =>
      recentPayments.filter(
        (payment) => String(payment.status || "").toLowerCase() === "otp_sent"
      ),
    [recentPayments]
  );

  const otpRequiresCode =
    String(otpTargetPayment?.paymentMethod || "").toLowerCase() === "card";

  const payableBill = [currentBill, ...billHistory].find(
    (bill) =>
      bill &&
      Number(bill?.totals?.outstanding || 0) > 0 &&
      !["paid", "cancelled"].includes(String(bill?.status || ""))
  );

  const canPayCurrentBill =
    Boolean(payableBill) && Number(payableBill?.totals?.outstanding || 0) > 0;

  const isCardPayment = paymentForm.paymentMethod === "Card";

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "paymentMethod") {
      setPaymentForm((current) => ({
        ...current,
        paymentMethod: value,
        receiptUrl: value === "Card" ? "" : current.receiptUrl,
        receiptFileName: value === "Card" ? "" : current.receiptFileName,
      }));
      return;
    }

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSlipUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultValue =
        typeof reader.result === "string" ? reader.result : "";
      setPaymentForm((current) => ({
        ...current,
        receiptUrl: resultValue,
        receiptFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const slipPreviewType = getSlipPreviewType(
    paymentForm.receiptUrl,
    paymentForm.receiptFileName
  );

  const handleInitiatePayment = async (event) => {
    event.preventDefault();
    if (!payableBill) {
      return;
    }

    if (!isCardPayment && !paymentForm.receiptUrl) {
      setFeedback({
        type: "error",
        message: "Please upload your payment slip before submitting this payment.",
      });
      return;
    }

    if (
      isCardPayment &&
      (!paymentForm.cardHolderName.trim() ||
        !paymentForm.cardNumber.trim() ||
        !paymentForm.cardExpiryMonth.trim() ||
        !paymentForm.cardExpiryYear.trim() ||
        !paymentForm.cardCvv.trim())
    ) {
      setFeedback({
        type: "error",
        message: "Please complete all required card details.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await initiatePayment({
        billId: payableBill.id,
        amount: payableBill.totals.outstanding,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber,
        transactionReference: paymentForm.transactionReference,
        receiptUrl: paymentForm.receiptUrl,
        cardNetwork: paymentForm.cardNetwork,
        cardHolderName: paymentForm.cardHolderName,
        cardNumber: paymentForm.cardNumber,
        cardExpiryMonth: paymentForm.cardExpiryMonth,
        cardExpiryYear: paymentForm.cardExpiryYear,
        cardCvv: paymentForm.cardCvv,
        notes: paymentForm.notes,
      });

      if (response.data.requiresOtp) {
        setOtpTargetPayment(response.data.payment);
        setOtpModalOpen(true);
        setOtpCode("");
        setFeedback({
          type: "success",
          message:
            "Verification code sent to your email. Enter the OTP below to complete payment verification.",
        });
      } else {
        setOtpTargetPayment(null);
        setOtpModalOpen(false);
        setFeedback({
          type: "success",
          message:
            "Payment request submitted successfully. It is now waiting for admin approval.",
        });
        setPaymentForm(initialPaymentForm);
      }

      setSlipPreviewOpen(false);

      await loadPaymentDashboard();
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to start the payment request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPayment = async (event) => {
    event.preventDefault();
    if (!otpTargetPayment?.id) {
      return;
    }

    if (otpRequiresCode && !otpCode.trim()) {
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await verifyPayment(
        otpTargetPayment.id,
        otpRequiresCode ? { code: otpCode.trim() } : {}
      );
      setFeedback({
        type: "success",
        message:
          "OTP verified successfully. Your payment request is now waiting for admin approval.",
      });
      setOtpModalOpen(false);
      setOtpTargetPayment(null);
      setOtpCode("");
      setPaymentForm(initialPaymentForm);
      await loadPaymentDashboard();
    } catch (error) {
      console.error("Failed to verify payment OTP:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message || "OTP verification failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openOtpVerificationModal = (payment) => {
    setOtpTargetPayment(payment);
    setOtpCode("");
    setOtpModalOpen(true);
  };

  const closeOtpVerificationModal = () => {
    setOtpModalOpen(false);
    setOtpCode("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => navigate("/StudentProfile")}
                  className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white mb-3 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to profile
                </button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Payment Center
                </h1>
                <p className="text-blue-100 mt-1">
                  Track your red bill, verify payments, and review recent payment activity.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/15">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-100">
                  Student
                </p>
                <p className="text-lg font-semibold">{user.fullName || "Student"}</p>
                <p className="text-sm text-blue-100">
                  {summaryData?.student?.itNumber || user.itNumber || "Profile active"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {feedback.message && (
            <div
              className={`mb-6 border-l-4 px-4 py-3 rounded-lg shadow-sm ${feedback.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <i
                  className={`bi ${feedback.type === "success"
                    ? "bi-check-circle-fill"
                    : "bi-exclamation-triangle-fill"
                    }`}
                ></i>
                <span className="text-sm font-medium">{feedback.message}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                title: "Current Bill",
                value: formatCurrency(summary?.currentMonthAmount || 0),
                subtitle: summary?.currentMonth || "No month",
                icon: <ReceiptText size={20} />,
              },
              {
                title: "Outstanding",
                value: formatCurrency(summary?.totalOutstanding || 0),
                subtitle: `${summary?.overdueBills || 0} overdue bills`,
                icon: <Wallet size={20} />,
              },
              {
                title: "Total Paid",
                value: formatCurrency(summary?.totalPaid || 0),
                subtitle: `${summary?.paidBills || 0} paid bills`,
                icon: <ShieldCheck size={20} />,
              },
              {
                title: "Pending Bills",
                value: `${summary?.pendingBills || 0}`,
                subtitle: "Awaiting settlement",
                icon: <CalendarClock size={20} />,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-md border border-blue-100 p-5 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                      {item.title}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
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
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Current Red Bill</h2>
                    <p className="text-sm text-gray-500">
                      Monthly room price + utility bills + late fee if applicable
                    </p>
                  </div>
                  {currentBill && (
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border ${getBillStatusClasses(
                        currentBill.status
                      )}`}
                    >
                      {currentBill.status.replace("_", " ")}
                    </span>
                  )}
                </div>

                {currentBill ? (
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">Billing Month</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">
                          {currentBill.billMonth}
                        </h3>
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>Due Date: {formatDisplayDate(currentBill.dueDate)}</p>
                          <p>
                            Room: {currentBill.student.roomNumber || "Not assigned"} /{" "}
                            {currentBill.student.block || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100">
                        <p className="text-sm text-gray-500">Total Payable</p>
                        <h3 className="mt-2 text-3xl font-bold text-blue-700">
                          {formatCurrency(currentBill.totals.total)}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Outstanding: {formatCurrency(currentBill.totals.outstanding)}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Room Price", value: currentBill.breakdown.roomPrice },
                        { label: "Current Bill", value: currentBill.breakdown.currentBill },
                        { label: "Water Bill", value: currentBill.breakdown.waterBill },
                        { label: "Late Fee", value: currentBill.breakdown.lateFee },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            {item.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-gray-800">
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {currentBill.breakdown.additionalFees?.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">
                          Additional Fees
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {currentBill.breakdown.additionalFees.map((fee) => (
                            <div
                              key={`${fee.label}-${fee.amount}`}
                              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-blue-100"
                            >
                              <span className="text-sm text-gray-700">{fee.label}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(fee.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-sm text-gray-500">
                    No current bill is available for this student account yet.
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Track accepted, pending, and reviewed payment requests
                  </p>
                </div>

                <div className="p-6 overflow-x-auto">
                  <table className="w-full min-w-[680px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                        <th className="pb-3">Payment ID</th>
                        <th className="pb-3">Month</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Created</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPayments.length > 0 ? (
                        recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="py-4 text-sm font-medium text-gray-800">
                              {payment.paymentId}
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {payment.billSnapshot?.billMonth || "N/A"}
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {payment.paymentMethod}
                            </td>
                            <td className="py-4 text-sm font-semibold text-gray-800">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium border ${getPaymentStatusClasses(
                                  normalizePaymentStatus(payment)
                                )}`}
                              >
                                {normalizePaymentStatus(payment).replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-gray-500">
                              {formatDisplayDate(payment.createdAt)}
                            </td>
                            <td className="py-4 text-sm">
                              {String(payment.status || "").toLowerCase() === "otp_sent" ? (
                                <button
                                  type="button"
                                  onClick={() => openOtpVerificationModal(payment)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                                >
                                  Verify OTP
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-6 text-sm text-gray-500 text-center">
                            No payment requests found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800">Make Payment</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Card payments require OTP. Online and Cash Deposit go directly to admin review.
                  </p>
                </div>

                <div className="p-6">
                  {canPayCurrentBill ? (
                    <form className="space-y-4" onSubmit={handleInitiatePayment}>
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">
                          Payable Bill
                        </p>
                        <p className="mt-2 text-2xl font-bold text-blue-700">
                          {formatCurrency(payableBill.totals.outstanding)}
                        </p>
                        <p className="mt-1 text-sm text-blue-600">
                          Bill Month: {payableBill.billMonth}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="payment-method"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Payment Method
                        </label>
                        <select
                          id="payment-method"
                          name="paymentMethod"
                          value={paymentForm.paymentMethod}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="Online">Online</option>
                          <option value="Card">Card</option>
                          <option value="Cash Deposit">Cash Deposit</option>
                        </select>
                      </div>

                      {isCardPayment && (
                        <>
                          <div>
                            <label
                              htmlFor="card-network"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Card Network
                            </label>
                            <select
                              id="card-network"
                              name="cardNetwork"
                              value={paymentForm.cardNetwork}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="Visa">Visa</option>
                              <option value="MasterCard">MasterCard</option>
                            </select>
                          </div>

                          <input
                            type="text"
                            name="cardHolderName"
                            value={paymentForm.cardHolderName}
                            onChange={handleFormChange}
                            placeholder="Card Holder Name"
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />

                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentForm.cardNumber}
                            onChange={handleFormChange}
                            placeholder="Card Number"
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />

                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              name="cardExpiryMonth"
                              value={paymentForm.cardExpiryMonth}
                              onChange={handleFormChange}
                              placeholder="MM"
                              maxLength="2"
                              className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              name="cardExpiryYear"
                              value={paymentForm.cardExpiryYear}
                              onChange={handleFormChange}
                              placeholder="YYYY"
                              maxLength="4"
                              className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <input
                              type="password"
                              name="cardCvv"
                              value={paymentForm.cardCvv}
                              onChange={handleFormChange}
                              placeholder="CVV"
                              maxLength="4"
                              className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        </>
                      )}

                      {!isCardPayment && (
                        <div>
                          <label
                            htmlFor="receipt-upload"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Upload Payment Slip
                          </label>
                          <input
                            id="receipt-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleSlipUpload}
                            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          {paymentForm.receiptFileName && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FileUp size={14} />
                                {paymentForm.receiptFileName}
                              </p>
                              <button
                                type="button"
                                onClick={() => setSlipPreviewOpen(true)}
                                className="text-xs font-medium text-blue-600 hover:underline"
                              >
                                Preview slip
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="text"
                        name="referenceNumber"
                        value={paymentForm.referenceNumber}
                        onChange={handleFormChange}
                        placeholder="Reference Number"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />

                      <input
                        type="text"
                        name="transactionReference"
                        value={paymentForm.transactionReference}
                        onChange={handleFormChange}
                        placeholder="Transaction Reference"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />

                      <input
                        type="url"
                        name="receiptUrl"
                        value={paymentForm.receiptUrl}
                        onChange={handleFormChange}
                        placeholder="Receipt URL (optional)"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />

                      <textarea
                        name="notes"
                        rows="3"
                        value={paymentForm.notes}
                        onChange={handleFormChange}
                        placeholder="Notes for admin review"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      ></textarea>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} />
                        {getSubmitButtonLabel(submitting, isCardPayment)}
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      There is no unpaid bill available right now.
                    </div>
                  )}
                </div>
              </div>

              {pendingOtpPayments.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  {`You have ${pendingOtpPayments.length} payment request(s) waiting for OTP verification. Use the Verify OTP button in Payment History.`}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800">Bill History</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Monthly bill status and outstanding balance
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {billHistory.length > 0 ? (
                    billHistory.map((bill) => (
                      <div
                        key={bill.id}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {bill.billMonth}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due {formatDisplayDate(bill.dueDate)}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium border ${getBillStatusClasses(
                              bill.status
                            )}`}
                          >
                            {bill.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(bill.totals.total)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Outstanding</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(bill.totals.outstanding)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No bill history available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {slipPreviewOpen && paymentForm.receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSlipPreviewOpen(false)}
            aria-label="Close slip preview backdrop"
          />

          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Slip Preview</h3>
                <p className="text-sm text-gray-500">{paymentForm.receiptFileName || "Uploaded slip"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSlipPreviewOpen(false)}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {slipPreviewType === "image" ? (
                <img
                  src={paymentForm.receiptUrl}
                  alt="Uploaded payment slip preview"
                  className="max-h-[70vh] w-full object-contain rounded-2xl border border-gray-200 bg-gray-50"
                />
              ) : (
                <iframe
                  title="Uploaded payment slip preview"
                  src={paymentForm.receiptUrl}
                  className="h-[70vh] w-full rounded-2xl border border-gray-200 bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {otpModalOpen && otpTargetPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOtpVerificationModal}
            aria-label="Close OTP verification modal"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verify OTP</h3>
                <p className="text-sm text-gray-500">Payment request: {otpTargetPayment.paymentId}</p>
              </div>
              <button
                type="button"
                onClick={closeOtpVerificationModal}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleVerifyPayment}>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                {otpRequiresCode
                  ? "Enter the 6-digit code sent to your registered email address."
                  : "This payment method does not require OTP. Click verify to continue to admin review."}
              </div>

              {otpRequiresCode && (
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(event) =>
                    setOtpCode(event.target.value.replaceAll(/\D/g, ""))
                  }
                  placeholder="Enter OTP code"
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tracking-[0.5em] text-center text-lg font-semibold"
                />
              )}

              <button
                type="submit"
                disabled={submitting || (otpRequiresCode && otpCode.length !== 6)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <ShieldCheck size={18} />
                {submitting
                  ? "Verifying..."
                  : otpRequiresCode
                    ? "Verify Payment OTP"
                    : "Continue To Admin Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPaymentsDashboard;
