const StudentBill = require("../Model/StudentBillModel");
const Payment = require("../Model/PaymentModel");

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const isValidCardNumber = (input) => {
  const digits = String(input || "").replace(/\D/g, "");
  return /^\d{12,19}$/.test(digits);
};

const buildPeriodLabel = (month, year, cycle) => {
  if (cycle === "yearly") return String(year);
  if (cycle === "one_time") return "One Time";
  if (!month || !year) return "Custom";
  return new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const calculateLateFeeAmount = (bill) => {
  if (!bill || bill.lateFeeType === "none" || !bill.lateFeeValue) return 0;
  if (bill.lateFeeType === "fixed") return roundMoney(bill.lateFeeValue);
  return roundMoney((bill.baseAmount * bill.lateFeeValue) / 100);
};

const syncBillAmounts = (bill) => {
  bill.totalAmount = roundMoney(bill.baseAmount + bill.lateFeeAmount);
  bill.paidAmount = roundMoney(bill.paidAmount);
  bill.balanceAmount = roundMoney(Math.max(0, bill.totalAmount - bill.paidAmount));

  if (bill.status === "cancelled") return bill;
  if (bill.balanceAmount <= 0) {
    bill.status = "paid";
  } else if (bill.paidAmount > 0) {
    bill.status = bill.dueDate < new Date() ? "overdue" : "partial";
  } else {
    bill.status = bill.dueDate < new Date() ? "overdue" : "unpaid";
  }
  return bill;
};

const applyLateFeeIfNeeded = async (bill) => {
  if (!bill || bill.status === "paid" || bill.status === "cancelled") return bill;
  if (bill.isPenaltyApplied) {
    syncBillAmounts(bill);
    return bill;
  }
  if (!bill.dueDate || new Date(bill.dueDate) >= new Date()) {
    syncBillAmounts(bill);
    return bill;
  }

  const lateFeeAmount = calculateLateFeeAmount(bill);
  if (lateFeeAmount > 0) {
    bill.lateFeeAmount = lateFeeAmount;
    bill.isPenaltyApplied = true;
  }
  syncBillAmounts(bill);
  await bill.save();
  return bill;
};

const applyLateFeesForStudent = async (studentId) => {
  const bills = await StudentBill.find({
    student: studentId,
    status: { $in: ["unpaid", "partial", "overdue"] },
  });

  for (const bill of bills) {
    await applyLateFeeIfNeeded(bill);
  }
};

const getStudentFinancialSummary = async (studentId) => {
  await applyLateFeesForStudent(studentId);

  const [bills, payments] = await Promise.all([
    StudentBill.find({ student: studentId }).sort({ dueDate: -1, createdAt: -1 }).lean(),
    Payment.find({ student: studentId, status: "success" }).sort({ paymentDate: -1, createdAt: -1 }).lean(),
  ]);

  const totalFees = roundMoney(bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0));
  const totalPaid = roundMoney(payments.reduce((sum, payment) => sum + (payment.amount || 0), 0));
  const remainingBalance = roundMoney(
    bills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0)
  );
  const overdueBills = bills.filter((bill) => bill.status === "overdue").length;
  const paidBills = bills.filter((bill) => bill.status === "paid").length;

  const monthlyTotals = {};
  for (const bill of bills) {
    const label = buildPeriodLabel(bill.periodMonth, bill.periodYear, bill.billingCycle);
    if (!monthlyTotals[label]) {
      monthlyTotals[label] = { period: label, total: 0, paid: 0, balance: 0 };
    }
    monthlyTotals[label].total = roundMoney(monthlyTotals[label].total + (bill.totalAmount || 0));
    monthlyTotals[label].paid = roundMoney(monthlyTotals[label].paid + (bill.paidAmount || 0));
    monthlyTotals[label].balance = roundMoney(
      monthlyTotals[label].balance + (bill.balanceAmount || 0)
    );
  }

  const yearlyTotals = {};
  for (const bill of bills) {
    const key = String(bill.periodYear || new Date(bill.createdAt).getFullYear());
    if (!yearlyTotals[key]) {
      yearlyTotals[key] = { year: Number(key), total: 0, paid: 0, balance: 0 };
    }
    yearlyTotals[key].total = roundMoney(yearlyTotals[key].total + (bill.totalAmount || 0));
    yearlyTotals[key].paid = roundMoney(yearlyTotals[key].paid + (bill.paidAmount || 0));
    yearlyTotals[key].balance = roundMoney(yearlyTotals[key].balance + (bill.balanceAmount || 0));
  }

  return {
    totals: {
      totalFees,
      totalPaid,
      remainingBalance,
      overdueBills,
      paidBills,
      totalBills: bills.length,
      paymentCount: payments.length,
      paidPercentage: totalFees > 0 ? Math.min(100, roundMoney((totalPaid / totalFees) * 100)) : 0,
    },
    monthlyBreakdown: Object.values(monthlyTotals).sort((a, b) =>
      a.period.localeCompare(b.period)
    ),
    yearlyBreakdown: Object.values(yearlyTotals).sort((a, b) => a.year - b.year),
    bills,
    payments,
  };
};

module.exports = {
  roundMoney,
  isValidCardNumber,
  buildPeriodLabel,
  calculateLateFeeAmount,
  syncBillAmounts,
  applyLateFeeIfNeeded,
  applyLateFeesForStudent,
  getStudentFinancialSummary,
};
