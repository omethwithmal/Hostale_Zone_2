const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const express = require("express");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const Register = require("../../LoginSignup/model");
const RoomDetails = require("../../RoomDetailsForm/models/roomdetail");
const FeeProfile = require("../models/FeeProfile");
const StudentBill = require("../models/StudentBill");
const PaymentRecord = require("../models/Payment");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your_jwt_secret_key_here_change_this_in_production";
const DEFAULT_LATE_FEE_PERCENTAGE = Number(
  process.env.DEFAULT_LATE_FEE_PERCENTAGE || 5
);
const DEFAULT_PAYMENT_WINDOW_DAYS = Number(
  process.env.DEFAULT_PAYMENT_WINDOW_DAYS || 30
);
const OTP_EXPIRY_MINUTES = Number(
  process.env.PAYMENT_OTP_EXPIRY_MINUTES || 10
);
const OTP_MAX_ATTEMPTS = Number(process.env.PAYMENT_OTP_MAX_ATTEMPTS || 5);
const PAYMENT_CRON_SCHEDULE =
  process.env.PAYMENT_CRON_SCHEDULE || "0 8 * * *";
const CRON_TIMEZONE = process.env.CRON_TIMEZONE || "Asia/Colombo";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "no-reply@hostelzone.local";

let mailTransporter = null;
let paymentCronStarted = false;

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function padMonth(month) {
  return String(month).padStart(2, "0");
}

function startOfDay(date = new Date()) {
  const target = new Date(date);
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    0,
    0,
    0,
    0
  );
}

function addDays(date, days) {
  const target = new Date(date);
  target.setDate(target.getDate() + Number(days || 0));
  return target;
}

function getMonthRange(billMonth) {
  if (billMonth && /^\d{4}-\d{2}$/.test(billMonth)) {
    const [yearPart, monthPart] = billMonth.split("-");
    const year = Number(yearPart);
    const month = Number(monthPart);
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return {
      billMonth,
      year,
      month,
      startDate,
      endDate,
    };
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const normalizedMonth = `${year}-${padMonth(month)}`;

  return {
    billMonth: normalizedMonth,
    year,
    month,
    startDate: new Date(year, month - 1, 1, 0, 0, 0, 0),
    endDate: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

function getCurrentBillMonth() {
  return getMonthRange().billMonth;
}

function normalizeAdditionalFees(additionalFees) {
  if (!additionalFees) {
    return [];
  }

  let normalizedSource = additionalFees;

  if (typeof additionalFees === "string") {
    try {
      normalizedSource = JSON.parse(additionalFees);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(normalizedSource)) {
    return [];
  }

  return normalizedSource
    .map((fee) => ({
      label: String(fee?.label || "").trim(),
      amount: safeNumber(fee?.amount, 0),
    }))
    .filter((fee) => fee.label && fee.amount >= 0);
}

function extractBlock(roomNumber = "", explicitBlock = "") {
  if (explicitBlock && String(explicitBlock).trim()) {
    return String(explicitBlock).trim();
  }

  const normalizedRoom = String(roomNumber || "").trim();
  if (!normalizedRoom) {
    return "";
  }

  if (normalizedRoom.includes("-")) {
    return normalizedRoom.split("-")[0].trim().toUpperCase();
  }

  const firstChar = normalizedRoom.charAt(0);
  if (/[a-z]/i.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  return "";
}

function toPublicStudent(student) {
  if (!student) {
    return null;
  }

  return {
    id: student._id,
    itNumber: student.itNumber,
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    department: student.department,
    roomNumber: student.roomNumber || "",
    block: student.block || extractBlock(student.roomNumber),
    userType: student.userType,
    joiningDate: student.joiningDate || student.createdAt,
  };
}

function getStudentSnapshot(student) {
  return {
    itNumber: student?.itNumber || "",
    fullName: student?.fullName || "",
    email: student?.email || "",
  };
}

function getRoomSnapshot(room, roomNumber, block) {
  return {
    roomId: room?.roomId || "",
    roomNumber: roomNumber || room?.roomNumber || "",
    block: extractBlock(roomNumber || room?.roomNumber, block),
  };
}

function calculateAdditionalFeesTotal(additionalFees = []) {
  return additionalFees.reduce((sum, fee) => sum + safeNumber(fee.amount, 0), 0);
}

function calculateBasePricing(roomPrice, currentBill, waterBill, additionalFees) {
  const additionalFeesTotal = calculateAdditionalFeesTotal(additionalFees);

  return {
    roomPrice: safeNumber(roomPrice, 0),
    currentBill: safeNumber(currentBill, 0),
    waterBill: safeNumber(waterBill, 0),
    additionalFees,
    additionalFeesTotal,
    total:
      safeNumber(roomPrice, 0) +
      safeNumber(currentBill, 0) +
      safeNumber(waterBill, 0) +
      additionalFeesTotal,
  };
}

function formatCurrency(amount) {
  return `LKR ${safeNumber(amount, 0).toFixed(2)}`;
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeCardNumber(value) {
  return String(value || "").split(/\s|-/).join("");
}

function isCardPaymentMethod(method) {
  return String(method || "").trim().toLowerCase() === "card";
}

function validateCardPaymentFields({
  cardNetwork,
  cardHolderName,
  normalizedCardNumber,
  expiryMonth,
  expiryYear,
  cardCvv,
}) {
  if (!["Visa", "MasterCard"].includes(cardNetwork)) {
    return "Card network must be Visa or MasterCard.";
  }

  if (!cardHolderName) {
    return "Card holder name is required for card payments.";
  }

  if (!/^\d{12,19}$/.test(normalizedCardNumber)) {
    return "Please provide a valid card number.";
  }

  if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) {
    return "Card expiry month must be in MM format.";
  }

  if (!/^\d{4}$/.test(expiryYear)) {
    return "Card expiry year must be in YYYY format.";
  }

  if (!/^\d{3,4}$/.test(String(cardCvv || "").trim())) {
    return "Please provide a valid CVV.";
  }

  return "";
}

function validateInitiatePaymentRequest({
  bill,
  paymentMethod,
  allowedMethods,
  requestedAmount,
  outstandingAmount,
  isCardPayment,
  receiptUrl,
  cardPayload,
}) {
  if (
    ["paid", "cancelled"].includes(bill.status) ||
    safeNumber(bill.totals.outstanding, 0) <= 0
  ) {
    return "This bill has already been settled.";
  }

  if (!allowedMethods.includes(paymentMethod)) {
    return "Unsupported payment method.";
  }

  if (requestedAmount <= 0 || requestedAmount !== outstandingAmount) {
    return "Student payments must match the full outstanding amount for the current month.";
  }

  if (isCardPayment) {
    return validateCardPaymentFields(cardPayload);
  }

  if (!String(receiptUrl || "").trim()) {
    return "Slip upload is required for Online and Cash Deposit payments.";
  }

  return "";
}

function applyAdminPaymentStatusFilter(query, status) {
  if (!status) {
    return;
  }

  if (status === "pending") {
    query.$or = [
      { status: "pending" },
      {
        status: "otp_sent",
        paymentMethod: { $in: ["Online", "Cash Deposit"] },
      },
    ];
    return;
  }

  if (status === "otp_sent") {
    query.status = "otp_sent";
    query.paymentMethod = "Card";
    return;
  }

  query.status = status;
}

function createTransporter() {
  if (mailTransporter) {
    return mailTransporter;
  }

  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure:
        String(process.env.EMAIL_SECURE || "").toLowerCase() === "true" ||
        Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    return mailTransporter;
  }

  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    mailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    return mailTransporter;
  }

  mailTransporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  console.warn(
    "[Payment] SMTP configuration is missing. Falling back to jsonTransport; emails will not be delivered to inboxes."
  );

  return mailTransporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    return {
      success: false,
      message: "Recipient email address is missing.",
    };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId || "",
    };
  } catch (error) {
    console.error("[Payment] Failed to send email:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

function getAuthToken(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies?.token || null;
}

async function resolveFallbackAuthUser(req) {
  const headerUserId = String(req.headers["x-user-id"] || "").trim();
  const headerEmail = String(req.headers["x-user-email"] || "")
    .trim()
    .toLowerCase();
  const headerItNumber = String(req.headers["x-user-it-number"] || "").trim();
  const headerUserType = String(req.headers["x-user-type"] || "")
    .trim()
    .toLowerCase();
  const headerUserName = String(req.headers["x-user-name"] || "").trim();

  let user = null;

  if (headerUserId && mongoose.Types.ObjectId.isValid(headerUserId)) {
    user = await Register.findById(headerUserId).select("-password");
  }

  if (!user && headerEmail) {
    user = await Register.findOne({ email: headerEmail }).select("-password");
  }

  if (!user && headerItNumber) {
    user = await Register.findOne({ itNumber: headerItNumber }).select(
      "-password"
    );
  }

  if (user) {
    return user;
  }

  // Temporary fallback for the payment module so the frontend can use the
  // local stored session until strict JWT-only auth is re-enabled.
  if (headerUserType === "admin") {
    return {
      _id: headerUserId || "local-admin",
      id: headerUserId || "local-admin",
      email: headerEmail,
      fullName: headerUserName || "Admin User",
      itNumber: headerItNumber || "",
      roomNumber: "",
      block: "",
      userType: "admin",
      joiningDate: new Date(),
    };
  }

  return null;
}

async function requireAuth(req, res, next) {
  const token = getAuthToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await Register.findById(decoded.id).select("-password");

      if (user) {
        req.authUser = user;
        return next();
      }
    } catch (error) {
      console.warn(
        "[Payment] JWT validation failed, falling back to local user context:",
        error.message
      );
    }
  }

  try {
    const fallbackUser = await resolveFallbackAuthUser(req);

    if (!fallbackUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication token or user context is required.",
      });
    }

    req.authUser = fallbackUser;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unable to resolve the authenticated payment user.",
      error: error.message,
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.authUser?.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin users can perform this action.",
    });
  }

  return next();
}

async function resolveStudent(identifier, fallbackUser = null) {
  if (!identifier || identifier === "me") {
    return fallbackUser;
  }

  let student = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    student = await Register.findById(identifier).select("-password");
  }

  if (!student) {
    student = await Register.findOne({
      $or: [{ itNumber: identifier }, { email: identifier }],
    }).select("-password");
  }

  return student;
}

async function getTargetStudent(req, res, options = {}) {
  const identifier =
    req.params.studentId ||
    req.query.studentId ||
    (options.allowBody ? req.body.studentId : null) ||
    req.authUser?._id?.toString();

  const student = await resolveStudent(identifier, req.authUser);

  if (!student) {
    res.status(404).json({
      success: false,
      message: "Student was not found.",
    });
    return null;
  }

  const isAdmin = req.authUser?.userType === "admin";
  if (!isAdmin && String(req.authUser?._id) !== String(student._id)) {
    res.status(403).json({
      success: false,
      message: "You can only access your own payment data.",
    });
    return null;
  }

  return student;
}

async function findRoomByRoomNumber(roomNumber) {
  if (!roomNumber) {
    return null;
  }

  return RoomDetails.findOne({
    $or: [{ roomNumber }, { roomId: roomNumber }],
  });
}

function buildProfileState(student, room, existingProfile = null, overrides = {}) {
  const hasOverride = (key) => Object.hasOwn(overrides, key);

  const additionalFees =
    hasOverride("additionalFees")
      ? normalizeAdditionalFees(overrides.additionalFees)
      : normalizeAdditionalFees(existingProfile?.charges?.additionalFees);

  const incomingRoomNumber =
    overrides.roomNumber || student?.roomNumber || room?.roomNumber || "";
  const incomingBlock = extractBlock(
    incomingRoomNumber,
    overrides.block || student?.block || existingProfile?.roomDetails?.block
  );

  const syncWithRoomPrice =
    typeof overrides.syncWithRoomPrice === "boolean"
      ? overrides.syncWithRoomPrice
      : existingProfile?.roomDetails?.syncWithRoomPrice ?? true;

  const derivedRoomPrice = syncWithRoomPrice
    ? room?.monthlyPrice
    : existingProfile?.roomDetails?.roomPrice;

  const roomPrice =
    hasOverride("roomPrice")
      ? safeNumber(overrides.roomPrice, 0)
      : safeNumber(derivedRoomPrice ?? room?.monthlyPrice, 0);

  const currentBill =
    hasOverride("currentBill")
      ? safeNumber(overrides.currentBill, 0)
      : safeNumber(existingProfile?.charges?.currentBill, 0);

  const waterBill =
    hasOverride("waterBill")
      ? safeNumber(overrides.waterBill, 0)
      : safeNumber(existingProfile?.charges?.waterBill, 0);

  const lateFeeType =
    overrides.lateFeeType || existingProfile?.charges?.lateFeeType || "percentage";
  const lateFeeValue =
    hasOverride("lateFeeValue")
      ? safeNumber(overrides.lateFeeValue, DEFAULT_LATE_FEE_PERCENTAGE)
      : safeNumber(
        existingProfile?.charges?.lateFeeValue,
        DEFAULT_LATE_FEE_PERCENTAGE
      );
  const paymentWindowDays =
    hasOverride("paymentWindowDays")
      ? safeNumber(overrides.paymentWindowDays, DEFAULT_PAYMENT_WINDOW_DAYS)
      : safeNumber(
        existingProfile?.charges?.paymentWindowDays,
        DEFAULT_PAYMENT_WINDOW_DAYS
      );

  const pricing = calculateBasePricing(
    roomPrice,
    currentBill,
    waterBill,
    additionalFees
  );

  return {
    studentSnapshot: getStudentSnapshot(student),
    roomDetails: {
      roomId: room?.roomId || existingProfile?.roomDetails?.roomId || "",
      roomNumber:
        incomingRoomNumber || existingProfile?.roomDetails?.roomNumber || "",
      block: incomingBlock,
      roomPrice: pricing.roomPrice,
      syncWithRoomPrice,
    },
    charges: {
      currentBill: pricing.currentBill,
      waterBill: pricing.waterBill,
      additionalFees,
      lateFeeType,
      lateFeeValue,
      paymentWindowDays,
    },
    pricing,
  };
}

async function ensureFeeProfile(student, overrides = {}) {
  const roomNumber = overrides.roomNumber || student.roomNumber;
  const room = await findRoomByRoomNumber(roomNumber);
  let profile = await FeeProfile.findOne({ student: student._id });

  const profileState = buildProfileState(student, room, profile, overrides);

  if (!profile) {
    profile = new FeeProfile({
      student: student._id,
    });
  }

  profile.studentSnapshot = profileState.studentSnapshot;
  profile.roomDetails = profileState.roomDetails;
  profile.charges = profileState.charges;

  if (overrides.notes !== undefined) {
    profile.notes = String(overrides.notes || "").trim();
  }

  if (overrides.updatedBy !== undefined) {
    profile.updatedBy = String(overrides.updatedBy || "").trim();
  }

  if (overrides.isActive !== undefined) {
    profile.isActive = Boolean(overrides.isActive);
  }

  await profile.save();

  return {
    profile,
    room,
    pricing: profileState.pricing,
  };
}

function recalculateBillTotalsAndStatus(bill) {
  bill.breakdown = bill.breakdown || {};
  bill.totals = bill.totals || {};

  const additionalFeesTotal = calculateAdditionalFeesTotal(
    bill.breakdown.additionalFees || []
  );

  bill.totals.subtotal =
    safeNumber(bill.breakdown.roomPrice, 0) +
    safeNumber(bill.breakdown.currentBill, 0) +
    safeNumber(bill.breakdown.waterBill, 0) +
    additionalFeesTotal;

  bill.totals.total =
    bill.totals.subtotal + safeNumber(bill.breakdown.lateFee, 0);

  bill.totals.outstanding = Math.max(
    safeNumber(bill.totals.total, 0) - safeNumber(bill.totals.paid, 0),
    0
  );

  if (bill.status === "cancelled") {
    return bill;
  }

  if (bill.totals.outstanding <= 0) {
    bill.status = "paid";
    bill.paidAt = bill.paidAt || new Date();
    return bill;
  }

  if (bill.dueDate && new Date(bill.dueDate) < startOfDay()) {
    bill.status = "overdue";
    return bill;
  }

  if (safeNumber(bill.totals.paid, 0) > 0) {
    bill.status = "partially_paid";
    return bill;
  }

  bill.status = "pending";
  return bill;
}

function serializeBill(bill) {
  const breakdown = bill?.breakdown || {};
  const totals = bill?.totals || {};
  const studentSnapshot = bill?.studentSnapshot || {};
  const roomSnapshot = bill?.roomSnapshot || {};

  return {
    id: bill._id,
    billId: bill.billId,
    billMonth: bill.billMonth,
    year: bill.year,
    month: bill.month,
    issuedDate: bill.issuedDate,
    dueDate: bill.dueDate,
    status: bill.status,
    redBill: bill.status === "overdue" || safeNumber(totals.outstanding, 0) > 0,
    student: {
      ...studentSnapshot,
      roomNumber: roomSnapshot.roomNumber || "",
      block: roomSnapshot.block || "",
    },
    breakdown: {
      roomPrice: safeNumber(breakdown.roomPrice, 0),
      currentBill: safeNumber(breakdown.currentBill, 0),
      waterBill: safeNumber(breakdown.waterBill, 0),
      lateFee: safeNumber(breakdown.lateFee, 0),
      additionalFees: breakdown.additionalFees || [],
    },
    totals: {
      subtotal: safeNumber(totals.subtotal, 0),
      total: safeNumber(totals.total, 0),
      paid: safeNumber(totals.paid, 0),
      outstanding: safeNumber(totals.outstanding, 0),
    },
    notes: bill.notes || "",
    lateFeeApplied: bill.lateFeeApplied,
    lateFeeAppliedAt: bill.lateFeeAppliedAt,
    lastOverdueReminderAt: bill.lastOverdueReminderAt,
    paidAt: bill.paidAt,
  };
}

function serializePayment(payment) {
  const studentSnapshot = payment?.studentSnapshot || {};
  const roomSnapshot = payment?.roomSnapshot || {};
  const cardDetails = payment?.cardDetails || {};
  const normalizedStatus =
    payment?.status === "otp_sent" && !isCardPaymentMethod(payment?.paymentMethod)
      ? "pending"
      : payment?.status;

  return {
    id: payment._id,
    paymentId: payment.paymentId,
    billId: payment.bill,
    amount: safeNumber(payment.amount, 0),
    paymentMethod: payment.paymentMethod,
    status: normalizedStatus,
    cardDetails: {
      network: cardDetails.network || "",
      holderName: cardDetails.holderName || "",
      last4: cardDetails.last4 || "",
      expiryMonth: cardDetails.expiryMonth || "",
      expiryYear: cardDetails.expiryYear || "",
    },
    student: {
      ...studentSnapshot,
      roomNumber: roomSnapshot.roomNumber || "",
      block: roomSnapshot.block || "",
    },
    billSnapshot: payment.billSnapshot || {},
    referenceNumber: payment.referenceNumber,
    transactionReference: payment.transactionReference,
    receiptUrl: payment.receiptUrl,
    notes: payment.notes,
    adminDecisionBy: payment.adminDecisionBy,
    adminDecisionReason: payment.adminDecisionReason,
    adminDecisionAt: payment.adminDecisionAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

async function applyLateFeeIfNeeded(bill, feeProfile, force = false) {
  if (!bill) {
    return bill;
  }

  bill.breakdown = bill.breakdown || {};
  bill.totals = bill.totals || {};

  if (bill.status === "cancelled" || safeNumber(bill.totals.outstanding, 0) <= 0) {
    return bill;
  }

  const isPastDue = bill.dueDate && new Date(bill.dueDate) < startOfDay();
  if (!force && !isPastDue) {
    return bill;
  }

  if (!bill.lateFeeApplied || force) {
    const lateFeeType = feeProfile?.charges?.lateFeeType || "percentage";
    const lateFeeValue = safeNumber(
      feeProfile?.charges?.lateFeeValue,
      DEFAULT_LATE_FEE_PERCENTAGE
    );

    const baseAmount =
      safeNumber(bill.breakdown.roomPrice, 0) +
      safeNumber(bill.breakdown.currentBill, 0) +
      safeNumber(bill.breakdown.waterBill, 0) +
      calculateAdditionalFeesTotal(bill.breakdown.additionalFees || []);

    const calculatedLateFee =
      lateFeeType === "fixed"
        ? lateFeeValue
        : Number(((baseAmount * lateFeeValue) / 100).toFixed(2));

    bill.breakdown.lateFee = safeNumber(calculatedLateFee, 0);
    bill.lateFeeApplied = true;
    bill.lateFeeAppliedAt = new Date();
  }

  recalculateBillTotalsAndStatus(bill);
  await bill.save();
  return bill;
}

async function ensureMonthlyBill(student, options = {}) {
  const targetMonth = options.billMonth || getCurrentBillMonth();
  const overwrite = Boolean(options.overwrite);
  const { billMonth, year, month, startDate, endDate } = getMonthRange(targetMonth);

  const existingBill = await StudentBill.findOne({
    student: student._id,
    billMonth,
  });

  if (existingBill && !overwrite) {
    const feeProfile = await FeeProfile.findById(existingBill.feeProfile);
    return {
      bill: await applyLateFeeIfNeeded(existingBill, feeProfile),
      created: false,
    };
  }

  const { profile, room } = await ensureFeeProfile(student, {});
  const issueDate = options.issuedDate ? new Date(options.issuedDate) : startDate;
  const dueDate = options.dueDate
    ? new Date(options.dueDate)
    : addDays(issueDate, safeNumber(profile.charges.paymentWindowDays, DEFAULT_PAYMENT_WINDOW_DAYS));

  const roomSnapshot = getRoomSnapshot(
    room,
    profile.roomDetails.roomNumber,
    profile.roomDetails.block
  );

  const billPayload = {
    student: student._id,
    feeProfile: profile._id,
    billMonth,
    year,
    month,
    billingPeriod: {
      startDate,
      endDate,
    },
    issuedDate: issueDate,
    dueDate,
    studentSnapshot: getStudentSnapshot(student),
    roomSnapshot,
    breakdown: {
      roomPrice: safeNumber(profile.roomDetails.roomPrice, 0),
      currentBill: safeNumber(profile.charges.currentBill, 0),
      waterBill: safeNumber(profile.charges.waterBill, 0),
      lateFee: existingBill?.breakdown?.lateFee || 0,
      additionalFees: normalizeAdditionalFees(profile.charges.additionalFees),
    },
    totals: {
      paid: safeNumber(existingBill?.totals?.paid, 0),
    },
    notes: options.notes || existingBill?.notes || "",
    lateFeeApplied: existingBill?.lateFeeApplied || false,
    lateFeeAppliedAt: existingBill?.lateFeeAppliedAt || null,
    lastOverdueReminderAt: existingBill?.lastOverdueReminderAt || null,
    acceptedPayment: existingBill?.acceptedPayment || null,
  };

  const bill = existingBill || new StudentBill();
  Object.assign(bill, billPayload);
  recalculateBillTotalsAndStatus(bill);
  await bill.save();

  return {
    bill: await applyLateFeeIfNeeded(bill, profile),
    created: !existingBill,
  };
}

function buildCsv(headers, rows) {
  const escapeValue = (value) => {
    const normalized = value === undefined || value === null ? "" : String(value);
    if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
      return `"${normalized.replaceAll('"', '""')}"`;
    }

    return normalized;
  };

  const headerRow = headers.map((header) => escapeValue(header.label)).join(",");
  const dataRows = rows.map((row) =>
    headers.map((header) => escapeValue(row[header.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

async function processOverdueBills() {
  const overdueCandidates = await StudentBill.find({
    status: { $in: ["pending", "partially_paid", "overdue"] },
    dueDate: { $lt: startOfDay() },
    "totals.outstanding": { $gt: 0 },
  });

  for (const bill of overdueCandidates) {
    const student = await Register.findById(bill.student).select("-password");
    if (!student) {
      continue;
    }

    const feeProfile = bill.feeProfile
      ? await FeeProfile.findById(bill.feeProfile)
      : await FeeProfile.findOne({ student: student._id });

    await applyLateFeeIfNeeded(bill, feeProfile);

    if (
      bill.lastOverdueReminderAt &&
      startOfDay(bill.lastOverdueReminderAt).getTime() === startOfDay().getTime()
    ) {
      continue;
    }

    await sendEmail({
      to: student.email,
      subject: `Overdue hostel payment for ${bill.billMonth}`,
      text: [
        `Hello ${student.fullName},`,
        "",
        `Your hostel payment for ${bill.billMonth} is overdue.`,
        `Room: ${bill.roomSnapshot.roomNumber || "Not assigned"}`,
        `Outstanding amount: ${formatCurrency(bill.totals.outstanding)}`,
        `Due date: ${new Date(bill.dueDate).toLocaleDateString()}`,
        "",
        "A late payment charge has been applied to your bill.",
        "Please contact the hostel admin or settle the bill as soon as possible.",
      ].join("\n"),
    });

    bill.lastOverdueReminderAt = new Date();
    await bill.save();
  }
}

function initializePaymentCron() {
  if (paymentCronStarted) {
    return;
  }

  cron.schedule(
    PAYMENT_CRON_SCHEDULE,
    async () => {
      try {
        await processOverdueBills();
      } catch (error) {
        console.error("[Payment] Overdue payment cron failed:", error.message);
      }
    },
    {
      timezone: CRON_TIMEZONE,
    }
  );

  paymentCronStarted = true;
  console.log(
    `[Payment] Overdue reminder cron started (${PAYMENT_CRON_SCHEDULE}, ${CRON_TIMEZONE}).`
  );
}

router.post("/preview", requireAuth, async (req, res) => {
  try {
    const requestedStudent = req.body.studentId
      ? await resolveStudent(req.body.studentId)
      : req.authUser;

    if (!requestedStudent && !req.body.roomNumber) {
      return res.status(400).json({
        success: false,
        message: "A student or room number is required to preview pricing.",
      });
    }

    if (
      requestedStudent &&
      req.authUser.userType !== "admin" &&
      String(requestedStudent._id) !== String(req.authUser._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only preview your own billing details.",
      });
    }

    const student =
      requestedStudent ||
      ({
        itNumber: "",
        fullName: "",
        email: "",
        roomNumber: req.body.roomNumber || "",
        block: req.body.block || extractBlock(req.body.roomNumber),
      });

    const existingProfile =
      requestedStudent &&
      (await FeeProfile.findOne({ student: requestedStudent._id }));
    const room = await findRoomByRoomNumber(req.body.roomNumber || student.roomNumber);
    const preview = buildProfileState(student, room, existingProfile, req.body);

    return res.json({
      success: true,
      preview: {
        student: requestedStudent ? toPublicStudent(requestedStudent) : null,
        room: room
          ? {
            id: room._id,
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            monthlyPrice: safeNumber(room.monthlyPrice, 0),
            roomType: room.roomType,
          }
          : null,
        feeProfileId: existingProfile?._id || null,
        roomDetails: preview.roomDetails,
        charges: preview.charges,
        pricing: preview.pricing,
        totalPrice: preview.pricing.total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to preview pricing.",
      error: error.message,
    });
  }
});

router.put("/profiles/upsert/:studentId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const student = await resolveStudent(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student was not found.",
      });
    }

    const { profile, room, pricing } = await ensureFeeProfile(student, {
      ...req.body,
      updatedBy: req.authUser.fullName || req.authUser.email || "Admin",
    });

    return res.json({
      success: true,
      message: "Student fee profile saved successfully.",
      profile: {
        id: profile._id,
        student: toPublicStudent(student),
        room: room
          ? {
            id: room._id,
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            monthlyPrice: safeNumber(room.monthlyPrice, 0),
          }
          : null,
        roomDetails: profile.roomDetails,
        charges: profile.charges,
        lastPricingTotal: profile.lastPricingTotal,
        notes: profile.notes,
        isActive: profile.isActive,
        updatedBy: profile.updatedBy,
        createdAt: profile.createdAt || new Date(),
        updatedAt: profile.updatedAt,
      },
      pricing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save the fee profile.",
      error: error.message,
    });
  }
});

router.get("/profiles/view/:studentId", requireAuth, async (req, res) => {
  try {
    const student = await getTargetStudent(req, res);
    if (!student) {
      return;
    }

    const { profile, pricing } = await ensureFeeProfile(student, {});

    return res.json({
      success: true,
      profile: {
        id: profile._id,
        student: toPublicStudent(student),
        roomDetails: profile.roomDetails,
        charges: profile.charges,
        notes: profile.notes,
        isActive: profile.isActive,
        updatedBy: profile.updatedBy,
        createdAt: profile.createdAt || new Date(),
        updatedAt: profile.updatedAt,
        pricing,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch the fee profile.",
      error: error.message,
    });
  }
});

router.post("/bills/generate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const requestedMonth = req.body.billMonth || getCurrentBillMonth();
    let students = [];

    if (req.body.studentId) {
      const student = await resolveStudent(req.body.studentId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student was not found.",
        });
      }

      students = [student];
    } else {
      students = await Register.find({
        userType: "student",
        isActive: true,
      }).select("-password");
    }

    const generatedBills = [];

    for (const student of students) {
      const { bill, created } = await ensureMonthlyBill(student, {
        billMonth: requestedMonth,
        overwrite: req.body.overwrite,
        issuedDate: req.body.issuedDate,
        dueDate: req.body.dueDate,
        notes: req.body.notes,
      });

      generatedBills.push({
        created,
        ...serializeBill(bill),
      });
    }

    return res.json({
      success: true,
      message: "Bills generated successfully.",
      count: generatedBills.length,
      bills: generatedBills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate bills.",
      error: error.message,
    });
  }
});

router.get("/bills/student/:studentId", requireAuth, async (req, res) => {
  try {
    const student = await getTargetStudent(req, res);
    if (!student) {
      return;
    }

    if (!req.query.billMonth) {
      await ensureMonthlyBill(student, {});
    }

    const query = { student: student._id };
    if (req.query.billMonth) {
      query.billMonth = req.query.billMonth;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bills = await StudentBill.find(query).sort({ year: -1, month: -1 });

    for (const bill of bills) {
      const feeProfile = bill.feeProfile
        ? await FeeProfile.findById(bill.feeProfile)
        : await FeeProfile.findOne({ student: student._id });
      await applyLateFeeIfNeeded(bill, feeProfile);
    }

    return res.json({
      success: true,
      bills: bills.map(serializeBill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student bills.",
      error: error.message,
    });
  }
});

router.get("/red-bill/:studentId", requireAuth, async (req, res) => {
  try {
    const student = await getTargetStudent(req, res);
    if (!student) {
      return;
    }

    const billMonth = req.query.billMonth || getCurrentBillMonth();
    const { bill } = await ensureMonthlyBill(student, {
      billMonth,
    });

    return res.json({
      success: true,
      redBill: serializeBill(bill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch the red bill.",
      error: error.message,
    });
  }
});

router.get("/summary/student/:studentId", requireAuth, async (req, res) => {
  try {
    const student = await getTargetStudent(req, res);
    if (!student) {
      return;
    }

    const { bill: currentBill } = await ensureMonthlyBill(student, {});
    const bills = await StudentBill.find({ student: student._id }).sort({
      year: -1,
      month: -1,
    });
    for (const bill of bills) {
      const feeProfile = bill.feeProfile
        ? await FeeProfile.findById(bill.feeProfile)
        : await FeeProfile.findOne({ student: student._id });
      await applyLateFeeIfNeeded(bill, feeProfile);
    }
    const payments = await PaymentRecord.find({ student: student._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const summary = bills.reduce(
      (acc, bill) => {
        acc.totalBilled += safeNumber(bill?.totals?.total, 0);
        acc.totalPaid += safeNumber(bill?.totals?.paid, 0);
        acc.totalOutstanding += safeNumber(bill?.totals?.outstanding, 0);

        if (bill.status === "paid") {
          acc.paidBills += 1;
        }

        if (bill.status === "overdue") {
          acc.overdueBills += 1;
        }

        if (bill.status === "pending" || bill.status === "partially_paid") {
          acc.pendingBills += 1;
        }

        return acc;
      },
      {
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        paidBills: 0,
        pendingBills: 0,
        overdueBills: 0,
      }
    );

    return res.json({
      success: true,
      student: toPublicStudent(student),
      summary: {
        ...summary,
        currentMonth: currentBill.billMonth,
        currentMonthAmount: safeNumber(currentBill.totals.total, 0),
        currentMonthOutstanding: safeNumber(currentBill.totals.outstanding, 0),
      },
      currentBill: serializeBill(currentBill),
      recentPayments: payments.map(serializePayment),
      bills: bills.slice(0, 12).map(serializeBill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch the payment summary.",
      error: error.message,
    });
  }
});

router.put("/bills/update/:billId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const bill = await StudentBill.findById(req.params.billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill was not found.",
      });
    }

    const additionalFees =
      Object.hasOwn(req.body, "additionalFees")
        ? normalizeAdditionalFees(req.body.additionalFees)
        : bill.breakdown.additionalFees;

    if (Object.hasOwn(req.body, "roomPrice")) {
      bill.breakdown.roomPrice = safeNumber(req.body.roomPrice, 0);
    }
    if (Object.hasOwn(req.body, "currentBill")) {
      bill.breakdown.currentBill = safeNumber(req.body.currentBill, 0);
    }
    if (Object.hasOwn(req.body, "waterBill")) {
      bill.breakdown.waterBill = safeNumber(req.body.waterBill, 0);
    }
    if (Object.hasOwn(req.body, "lateFee")) {
      bill.breakdown.lateFee = safeNumber(req.body.lateFee, 0);
      bill.lateFeeApplied = safeNumber(req.body.lateFee, 0) > 0;
      bill.lateFeeAppliedAt = bill.lateFeeApplied ? new Date() : null;
    }
    if (req.body.dueDate) {
      bill.dueDate = new Date(req.body.dueDate);
    }
    if (req.body.notes !== undefined) {
      bill.notes = String(req.body.notes || "").trim();
    }

    bill.breakdown.additionalFees = additionalFees;
    recalculateBillTotalsAndStatus(bill);
    await bill.save();

    return res.json({
      success: true,
      message: "Bill updated successfully.",
      bill: serializeBill(bill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update the bill.",
      error: error.message,
    });
  }
});

router.put(
  "/bills/apply-late-fee/:billId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const bill = await StudentBill.findById(req.params.billId);

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: "Bill was not found.",
        });
      }

      const feeProfile = bill.feeProfile
        ? await FeeProfile.findById(bill.feeProfile)
        : await FeeProfile.findOne({ student: bill.student });

      await applyLateFeeIfNeeded(bill, feeProfile, true);

      return res.json({
        success: true,
        message: "Late fee applied successfully.",
        bill: serializeBill(bill),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to apply the late fee.",
        error: error.message,
      });
    }
  }
);

router.delete("/bills/delete/:billId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const bill = await StudentBill.findById(req.params.billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill was not found.",
      });
    }

    if (safeNumber(bill.totals.paid, 0) > 0 || bill.status === "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Paid bills cannot be deleted directly. Reverse the payment first if this bill is incorrect.",
      });
    }

    await PaymentRecord.deleteMany({ bill: bill._id, status: { $ne: "accepted" } });
    await StudentBill.findByIdAndDelete(bill._id);

    return res.json({
      success: true,
      message: "Bill deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete the bill.",
      error: error.message,
    });
  }
});

router.post("/payments/initiate", requireAuth, async (req, res) => {
  try {
    const student = await getTargetStudent(req, res, { allowBody: true });
    if (!student) {
      return;
    }

    const bill = await StudentBill.findById(req.body.billId);

    if (!bill || String(bill.student) !== String(student._id)) {
      return res.status(404).json({
        success: false,
        message: "Bill was not found for this student.",
      });
    }

    const feeProfile = bill.feeProfile
      ? await FeeProfile.findById(bill.feeProfile)
      : await FeeProfile.findOne({ student: student._id });
    await applyLateFeeIfNeeded(bill, feeProfile);

    if (
      ["paid", "cancelled"].includes(bill.status) ||
      safeNumber(bill.totals.outstanding, 0) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "This bill has already been settled.",
      });
    }

    const allowedMethods = ["Card", "Online", "Cash Deposit"];
    const paymentMethod = String(req.body.paymentMethod || "").trim();
    const isCardPayment = isCardPaymentMethod(paymentMethod);

    const requestedAmount = safeNumber(req.body.amount, 0);
    const outstandingAmount = safeNumber(bill.totals.outstanding, 0);

    const normalizedCardNumber = normalizeCardNumber(req.body.cardNumber);
    const cardNetwork = String(req.body.cardNetwork || "").trim();
    const cardHolderName = String(req.body.cardHolderName || "").trim();
    const expiryMonth = String(req.body.cardExpiryMonth || "").trim();
    const expiryYear = String(req.body.cardExpiryYear || "").trim();

    const validationMessage = validateInitiatePaymentRequest({
      bill,
      paymentMethod,
      allowedMethods,
      requestedAmount,
      outstandingAmount,
      isCardPayment,
      receiptUrl: req.body.receiptUrl,
      cardPayload: {
        cardNetwork,
        cardHolderName,
        normalizedCardNumber,
        expiryMonth,
        expiryYear,
        cardCvv: req.body.cardCvv,
      },
    });

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const existingPendingPayment = await PaymentRecord.findOne({
      bill: bill._id,
      student: student._id,
      status: { $in: ["otp_sent", "pending"] },
    });

    if (existingPendingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "There is already a payment request waiting for OTP verification or admin review for this bill.",
      });
    }

    const verificationCode = isCardPayment ? generateVerificationCode() : "";
    const profile = await FeeProfile.findOne({ student: student._id });

    const payment = await PaymentRecord.create({
      student: student._id,
      bill: bill._id,
      feeProfile: profile?._id || null,
      studentSnapshot: getStudentSnapshot(student),
      roomSnapshot: {
        roomNumber: bill.roomSnapshot.roomNumber || student.roomNumber || "",
        block:
          bill.roomSnapshot.block ||
          student.block ||
          extractBlock(student.roomNumber),
      },
      billSnapshot: {
        billMonth: bill.billMonth,
        dueDate: bill.dueDate,
        totalAmount: safeNumber(bill.totals.total, 0),
        outstandingAmount,
      },
      amount: requestedAmount,
      paymentMethod,
      status: isCardPayment ? "otp_sent" : "pending",
      referenceNumber: String(req.body.referenceNumber || "").trim(),
      transactionReference: String(req.body.transactionReference || "").trim(),
      receiptUrl: String(req.body.receiptUrl || "").trim(),
      notes: String(req.body.notes || "").trim(),
      cardDetails: isCardPayment
        ? {
          network: cardNetwork,
          holderName: cardHolderName,
          last4: normalizedCardNumber.slice(-4),
          expiryMonth,
          expiryYear,
        }
        : {
          network: "",
          holderName: "",
          last4: "",
          expiryMonth: "",
          expiryYear: "",
        },
      verification: {
        codeHash: isCardPayment ? hashCode(verificationCode) : "",
        expiresAt: isCardPayment
          ? new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
          : null,
        attempts: 0,
        lastSentAt: isCardPayment ? new Date() : null,
        verifiedAt: isCardPayment ? null : new Date(),
      },
    });

    const emailResult = isCardPayment
      ? await sendEmail({
        to: student.email,
        subject: `Your Hostel Zone payment verification code`,
        text: [
          `Hello ${student.fullName},`,
          "",
          `Use the verification code below to continue your ${bill.billMonth} hostel payment.`,
          `Verification code: ${verificationCode}`,
          `Amount: ${formatCurrency(requestedAmount)}`,
          `Payment method: ${paymentMethod}`,
          "",
          `This code will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
          "If you did not start this payment, please ignore this email and contact the hostel admin.",
        ].join("\n"),
      })
      : await sendEmail({
        to: student.email,
        subject: `Payment request submitted for ${bill.billMonth}`,
        text: [
          `Hello ${student.fullName},`,
          "",
          `Your payment request ${payment.paymentId} has been submitted successfully and is now waiting for admin review.`,
          `Amount: ${formatCurrency(requestedAmount)}`,
          `Payment method: ${paymentMethod}`,
          "",
          "You will receive another email once the admin approves or rejects your request.",
        ].join("\n"),
      });

    if (isCardPayment && !emailResult.success) {
      await PaymentRecord.findByIdAndDelete(payment._id);

      return res.status(502).json({
        success: false,
        message: "Verification code email could not be sent. Please try again.",
        error: emailResult.message || "Unknown email delivery error.",
      });
    }

    return res.status(201).json({
      success: true,
      message: isCardPayment
        ? "Verification code sent to the student's email address."
        : "Payment request submitted successfully and is waiting for admin approval.",
      payment: serializePayment(payment),
      requiresOtp: isCardPayment,
      email: {
        delivered: emailResult.success,
        message: emailResult.message || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to initiate the payment.",
      error: error.message,
    });
  }
});

router.post("/payments/verify/:paymentId", requireAuth, async (req, res) => {
  try {
    const payment = await PaymentRecord.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment request was not found.",
      });
    }

    if (
      req.authUser.userType !== "admin" &&
      String(payment.student) !== String(req.authUser._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only verify your own payment request.",
      });
    }

    if (payment.status !== "otp_sent") {
      return res.status(400).json({
        success: false,
        message: "This payment request is not waiting for OTP verification.",
      });
    }

    payment.verification = payment.verification || {};

    if (!isCardPaymentMethod(payment.paymentMethod)) {
      payment.status = "pending";
      payment.verification.verifiedAt = new Date();
      payment.verification.codeHash = "";
      await payment.save();

      return res.json({
        success: true,
        message:
          "OTP verification is not required for this payment method. The request is now waiting for admin approval.",
        payment: serializePayment(payment),
      });
    }

    if (!req.body.code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required.",
      });
    }

    if (
      payment.verification.expiresAt &&
      new Date(payment.verification.expiresAt) < new Date()
    ) {
      payment.status = "cancelled";
      payment.adminDecisionReason = "OTP verification expired.";
      payment.adminDecisionAt = new Date();
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "The verification code has expired. Please start the payment again.",
      });
    }

    payment.verification.attempts = safeNumber(payment.verification.attempts, 0) + 1;

    if (payment.verification.attempts > OTP_MAX_ATTEMPTS) {
      payment.status = "cancelled";
      payment.adminDecisionReason = "Too many OTP verification attempts.";
      payment.adminDecisionAt = new Date();
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please start the payment again.",
      });
    }

    if (hashCode(req.body.code) !== payment.verification.codeHash) {
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    payment.status = "pending";
    payment.verification.verifiedAt = new Date();
    payment.verification.codeHash = "";
    await payment.save();

    return res.json({
      success: true,
      message:
        "Payment verification completed successfully. The request is now waiting for admin approval.",
      payment: serializePayment(payment),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify the payment.",
      error: error.message,
    });
  }
});

router.put("/payments/review/:paymentId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const payment = await PaymentRecord.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment request was not found.",
      });
    }

    const action = String(req.body.action || "").toLowerCase();
    if (!["accept", "reject", "cancel"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be one of: accept, reject, cancel.",
      });
    }

    const bill = await StudentBill.findById(payment.bill);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Related bill was not found.",
      });
    }

    payment.adminDecisionBy = req.authUser.fullName || req.authUser.email || "Admin";
    payment.adminDecisionReason = String(req.body.reason || "").trim();
    payment.adminDecisionAt = new Date();

    // Normalize old non-card records that were incorrectly saved as otp_sent.
    if (payment.status === "otp_sent" && !isCardPaymentMethod(payment.paymentMethod)) {
      payment.status = "pending";
    }

    const previousStatus = String(payment.status || "");
    const wasAccepted = previousStatus === "accepted";

    if (action === "accept") {
      // Only add to paid once when moving into accepted status.
      if (!wasAccepted) {
        bill.totals.paid = safeNumber(bill.totals.paid, 0) + safeNumber(payment.amount, 0);
      }
      bill.acceptedPayment = payment._id;
      recalculateBillTotalsAndStatus(bill);
      await bill.save();

      payment.status = "accepted";
      await payment.save();

      await sendEmail({
        to: payment.studentSnapshot.email,
        subject: `Payment accepted for ${payment.billSnapshot.billMonth}`,
        text: [
          `Hello ${payment.studentSnapshot.fullName},`,
          "",
          `Your payment request ${payment.paymentId} has been accepted by the hostel admin.`,
          `Bill month: ${payment.billSnapshot.billMonth}`,
          `Amount accepted: ${formatCurrency(payment.amount)}`,
          `Payment method: ${payment.paymentMethod}`,
          "",
          "Thank you for completing your hostel payment on time.",
        ].join("\n"),
      });

      return res.json({
        success: true,
        message: "Payment accepted successfully.",
        payment: serializePayment(payment),
        bill: serializeBill(bill),
      });
    }

    // If an already accepted payment is moved away from accepted,
    // reverse the previously added paid amount.
    if (wasAccepted) {
      bill.totals.paid = Math.max(
        safeNumber(bill.totals.paid, 0) - safeNumber(payment.amount, 0),
        0
      );
      if (String(bill.acceptedPayment) === String(payment._id)) {
        bill.acceptedPayment = null;
      }
      recalculateBillTotalsAndStatus(bill);
      await bill.save();
    }

    payment.status = action === "reject" ? "rejected" : "cancelled";
    await payment.save();

    await sendEmail({
      to: payment.studentSnapshot.email,
      subject:
        action === "reject"
          ? `Payment rejected for ${payment.billSnapshot.billMonth}`
          : `Payment cancelled for ${payment.billSnapshot.billMonth}`,
      text: [
        `Hello ${payment.studentSnapshot.fullName},`,
        "",
        action === "reject"
          ? `Your payment request ${payment.paymentId} has been rejected by the hostel admin.`
          : `Your payment request ${payment.paymentId} has been cancelled by the hostel admin.`,
        `Bill month: ${payment.billSnapshot.billMonth}`,
        `Payment method: ${payment.paymentMethod}`,
        `Amount: ${formatCurrency(payment.amount)}`,
        payment.adminDecisionReason
          ? `Reason: ${payment.adminDecisionReason}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return res.json({
      success: true,
      message:
        action === "reject"
          ? "Payment rejected successfully."
          : "Payment cancelled successfully.",
      payment: serializePayment(payment),
      bill: serializeBill(bill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to review the payment.",
      error: error.message,
    });
  }
});

router.delete(
  "/payments/delete/:paymentId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const payment = await PaymentRecord.findById(req.params.paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record was not found.",
        });
      }

      if (payment.status === "accepted") {
        const bill = await StudentBill.findById(payment.bill);
        if (bill) {
          bill.totals.paid = Math.max(
            safeNumber(bill.totals.paid, 0) - safeNumber(payment.amount, 0),
            0
          );
          if (String(bill.acceptedPayment) === String(payment._id)) {
            bill.acceptedPayment = null;
          }
          recalculateBillTotalsAndStatus(bill);
          await bill.save();
        }
      }

      await PaymentRecord.findByIdAndDelete(payment._id);

      return res.json({
        success: true,
        message: "Payment entry deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the payment entry.",
        error: error.message,
      });
    }
  }
);

router.get("/admin/alerts", requireAuth, requireAdmin, async (req, res) => {
  try {
    await processOverdueBills();

    const overdueBills = await StudentBill.find({
      status: "overdue",
      "totals.outstanding": { $gt: 0 },
    }).sort({ dueDate: 1 });

    const dueSoonDate = addDays(startOfDay(), 7);
    const dueSoonBills = await StudentBill.find({
      status: { $in: ["pending", "partially_paid"] },
      dueDate: { $gte: startOfDay(), $lte: dueSoonDate },
      "totals.outstanding": { $gt: 0 },
    }).sort({ dueDate: 1 });

    return res.json({
      success: true,
      alerts: {
        overdueCount: overdueBills.length,
        dueSoonCount: dueSoonBills.length,
        overdueStudents: overdueBills.map(serializeBill),
        dueSoonStudents: dueSoonBills.map(serializeBill),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin alerts.",
      error: error.message,
    });
  }
});

router.get("/admin/payment-details", requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.billMonth) {
      query.billMonth = req.query.billMonth;
    }
    if (req.query.roomNumber) {
      query["roomSnapshot.roomNumber"] = req.query.roomNumber;
    }
    if (req.query.block) {
      query["roomSnapshot.block"] = req.query.block;
    }
    if (req.query.studentId) {
      const student = await resolveStudent(req.query.studentId);
      if (student) {
        query.student = student._id;
      }
    }

    const bills = await StudentBill.find(query).sort({ year: -1, month: -1 });

    return res.json({
      success: true,
      count: bills.length,
      bills: bills.map(serializeBill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details.",
      error: error.message,
    });
  }
});

router.get("/admin/outstanding/summary", requireAuth, requireAdmin, async (req, res) => {
  try {
    const scope = req.query.scope === "annual" ? "annual" : "monthly";
    const now = new Date();
    const targetYear = Number(req.query.year || now.getFullYear());
    const targetMonth = Number(req.query.month || now.getMonth() + 1);

    const bills = await StudentBill.find({
      year: targetYear,
      ...(scope === "monthly" ? { month: targetMonth } : {}),
      ...(req.query.block ? { "roomSnapshot.block": req.query.block } : {}),
    }).sort({ year: -1, month: -1 });

    const summary = bills.reduce(
      (acc, bill) => {
        const block = bill.roomSnapshot?.block || "Unassigned";
        const total = safeNumber(bill?.totals?.total, 0);
        const paid = safeNumber(bill?.totals?.paid, 0);
        const outstanding = safeNumber(bill?.totals?.outstanding, 0);

        acc.totalBilled += total;
        acc.totalPaid += paid;
        acc.totalOutstanding += outstanding;

        if (!acc.byBlock[block]) {
          acc.byBlock[block] = {
            block,
            totalBilled: 0,
            totalPaid: 0,
            totalOutstanding: 0,
            billCount: 0,
          };
        }

        acc.byBlock[block].totalBilled += total;
        acc.byBlock[block].totalPaid += paid;
        acc.byBlock[block].totalOutstanding += outstanding;
        acc.byBlock[block].billCount += 1;

        return acc;
      },
      {
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        byBlock: {},
      }
    );

    return res.json({
      success: true,
      scope,
      year: targetYear,
      month: scope === "monthly" ? targetMonth : null,
      totalBilled: summary.totalBilled,
      totalPaid: summary.totalPaid,
      totalOutstanding: summary.totalOutstanding,
      byBlock: Object.values(summary.byBlock),
      hostelOutstanding: summary.totalOutstanding,
      bills: bills.map(serializeBill),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build the outstanding summary.",
      error: error.message,
    });
  }
});

router.get("/admin/outstanding/report", requireAuth, requireAdmin, async (req, res) => {
  try {
    const scope = req.query.scope === "annual" ? "annual" : "monthly";
    const now = new Date();
    const targetYear = Number(req.query.year || now.getFullYear());
    const targetMonth = Number(req.query.month || now.getMonth() + 1);

    const bills = await StudentBill.find({
      year: targetYear,
      ...(scope === "monthly" ? { month: targetMonth } : {}),
      ...(req.query.block ? { "roomSnapshot.block": req.query.block } : {}),
    }).sort({ year: -1, month: -1, "roomSnapshot.block": 1 });

    const rows = bills.map((bill) => ({
      billId: bill.billId,
      billMonth: bill.billMonth,
      studentITNumber: bill.studentSnapshot?.itNumber || "",
      studentName: bill.studentSnapshot?.fullName || "",
      block: bill.roomSnapshot?.block || "",
      roomNumber: bill.roomSnapshot?.roomNumber || "",
      status: bill.status,
      total: safeNumber(bill?.totals?.total, 0).toFixed(2),
      paid: safeNumber(bill?.totals?.paid, 0).toFixed(2),
      outstanding: safeNumber(bill?.totals?.outstanding, 0).toFixed(2),
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString() : "",
    }));

    if (String(req.query.format || "json").toLowerCase() === "csv") {
      const csv = buildCsv(
        [
          { key: "billId", label: "Bill ID" },
          { key: "billMonth", label: "Bill Month" },
          { key: "studentITNumber", label: "Student IT Number" },
          { key: "studentName", label: "Student Name" },
          { key: "block", label: "Block" },
          { key: "roomNumber", label: "Room Number" },
          { key: "status", label: "Status" },
          { key: "total", label: "Total Amount" },
          { key: "paid", label: "Paid Amount" },
          { key: "outstanding", label: "Outstanding Amount" },
          { key: "dueDate", label: "Due Date" },
        ],
        rows
      );

      res.setHeader("Content-Type", "text/csv");
      const monthSuffix = scope === "monthly" ? "-" + padMonth(targetMonth) : "";
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=\"outstanding-report-" + scope + "-" + targetYear + monthSuffix + ".csv\""
      );

      return res.send(csv);
    }

    return res.json({
      success: true,
      scope,
      year: targetYear,
      month: scope === "monthly" ? targetMonth : null,
      rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate the outstanding report.",
      error: error.message,
    });
  }
});

router.get("/admin/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = {};
    applyAdminPaymentStatusFilter(query, req.query.status);

    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.billMonth) {
      query["billSnapshot.billMonth"] = req.query.billMonth;
    }

    if (req.query.roomNumber) {
      query["roomSnapshot.roomNumber"] = req.query.roomNumber;
    }

    if (req.query.block) {
      query["roomSnapshot.block"] = req.query.block;
    }

    const payments = await PaymentRecord.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: payments.length,
      payments: payments.map(serializePayment),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment records.",
      error: error.message,
    });
  }
});

initializePaymentCron();

module.exports = router;
