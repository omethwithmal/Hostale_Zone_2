import { api } from "./axios";

export const getPaymentPreview = (payload) =>
  api.post("/payments/preview", payload);

export const upsertPaymentProfile = (studentId, payload) =>
  api.put(`/payments/profiles/upsert/${studentId}`, payload);

export const getPaymentProfile = (studentId = "me") =>
  api.get(`/payments/profiles/view/${studentId}`);

export const generateBills = (payload) => api.post("/payments/bills/generate", payload);

export const getStudentBills = (studentId = "me", params = {}) =>
  api.get(`/payments/bills/student/${studentId}`, { params });

export const getRedBill = (studentId = "me", params = {}) =>
  api.get(`/payments/red-bill/${studentId}`, { params });

export const getStudentPaymentSummary = (studentId = "me") =>
  api.get(`/payments/summary/student/${studentId}`);

export const updateBill = (billId, payload) =>
  api.put(`/payments/bills/update/${billId}`, payload);

export const applyLateFeeToBill = (billId) =>
  api.put(`/payments/bills/apply-late-fee/${billId}`, {});

export const deleteBill = (billId) =>
  api.delete(`/payments/bills/delete/${billId}`);

export const initiatePayment = (payload) =>
  api.post("/payments/payments/initiate", payload);

export const verifyPayment = (paymentId, payload) =>
  api.post(`/payments/payments/verify/${paymentId}`, payload);

export const reviewPayment = (paymentId, payload) =>
  api.put(`/payments/payments/review/${paymentId}`, payload);

export const deletePaymentRecord = (paymentId) =>
  api.delete(`/payments/payments/delete/${paymentId}`);

export const getAdminAlerts = () => api.get("/payments/admin/alerts");

export const getAdminPaymentDetails = (params = {}) =>
  api.get("/payments/admin/payment-details", { params });

export const getOutstandingSummary = (params = {}) =>
  api.get("/payments/admin/outstanding/summary", { params });

export const getOutstandingReport = (params = {}, format = "json") =>
  api.get("/payments/admin/outstanding/report", {
    params: { ...params, format },
    responseType: format === "csv" ? "blob" : "json",
  });

export const getAdminPayments = (params = {}) =>
  api.get("/payments/admin/payments", { params });
