const express = require("express");
const router = express.Router();

const { protect, protectAdmin } = require("../Middleware/auth");
const {
  getStudentFeeSummary,
  getStudentBills,
  getStudentPayments,
  createStudentPayment,
  createStripeCheckoutSession,
  verifyStripeCheckoutSession,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  generateBills,
  getAdminBills,
  updateBill,
  deleteBill,
  recordAdminPayment,
  deleteAdminPayment,
  getAdminStudentsFinancials,
  getStudentSummaryByAdmin,
  getAdminReports,
  sendOverdueReminders,
} = require("../Controlers/FeeController");

router.get("/my/summary", protect, getStudentFeeSummary);
router.get("/my/bills", protect, getStudentBills);
router.get("/my/payments", protect, getStudentPayments);
router.post("/my/payments", protect, createStudentPayment);
router.post("/my/payments/stripe/checkout", protect, createStripeCheckoutSession);
router.get("/my/payments/stripe/session/:sessionId", protect, verifyStripeCheckoutSession);

router.get("/admin/fee-structures", protectAdmin, getFeeStructures);
router.post("/admin/fee-structures", protectAdmin, createFeeStructure);
router.put("/admin/fee-structures/:id", protectAdmin, updateFeeStructure);
router.delete("/admin/fee-structures/:id", protectAdmin, deleteFeeStructure);

router.post("/admin/bills/generate", protectAdmin, generateBills);
router.get("/admin/bills", protectAdmin, getAdminBills);
router.put("/admin/bills/:id", protectAdmin, updateBill);
router.delete("/admin/bills/:id", protectAdmin, deleteBill);

router.post("/admin/payments", protectAdmin, recordAdminPayment);
router.delete("/admin/payments/:id", protectAdmin, deleteAdminPayment);
router.get("/admin/students", protectAdmin, getAdminStudentsFinancials);
router.get("/admin/students/:studentId/summary", protectAdmin, getStudentSummaryByAdmin);
router.get("/admin/reports", protectAdmin, getAdminReports);
router.post("/admin/reminders/overdue", protectAdmin, sendOverdueReminders);

app.use("/payment", require("./payment/routes/FeeRoute"));
module.exports = router;
