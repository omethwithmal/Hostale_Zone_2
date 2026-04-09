const mongoose = require("mongoose");
const Stripe = require("stripe");
const Student = require("../Model/StudentModel");
const FeeStructure = require("../Model/FeeStructureModel");
const StudentBill = require("../Model/StudentBillModel");
const Payment = require("../Model/PaymentModel");
const RoomBooking = require("../Model/RoomBookingModel");
const {
  roundMoney,
  isValidCardNumber,
  syncBillAmounts,
  applyLateFeeIfNeeded,
  getStudentFinancialSummary,
} = require("../utils/feeManagement");
const { notifyGeneral, notifyFeeReminder } = require("../utils/notificationHelper");
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const allowedBillTypes = ["hostel_fee", "electricity", "water", "other"];
const allowedCycles = ["monthly", "yearly", "one_time"];
const allowedPaymentMethods = ["cash", "card", "online"];
const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedBlocks = ["A", "B", "C"];
const billTypeLabels = {
  hostel_fee: "Hostel Fee",
  electricity: "Electricity",
  water: "Water",
  other: "Other",
};

const getConfirmedBlockBookings = async (block) => {
  const normalizedBlock = String(block || "").trim().toUpperCase();
  if (!allowedBlocks.includes(normalizedBlock)) {
    return { block: null, bookings: [], studentIds: [] };
  }

  const bookings = await RoomBooking.find({
    block: normalizedBlock,
    status: "confirmed",
  })
    .populate("student", "studentId fullName email")
    .lean();

  const uniqueStudentIds = Array.from(
    new Set(bookings.map((booking) => String(booking.student?._id || booking.student)).filter(Boolean))
  );

  return { block: normalizedBlock, bookings, studentIds: uniqueStudentIds };
};

const generateCode = (prefix) => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const ensureStripeConfigured = () => {
  if (!stripe) {
    const error = new Error("Stripe is not configured.");
    error.statusCode = 500;
    throw error;
  }
  return stripe;
};

const toStripeAmount = (amount) => Math.round(roundMoney(amount) * 100);

const validatePaymentRequest = async ({
  student,
  bill,
  amount,
  paymentMethod,
  paymentDate,
  referenceNumber,
  clientRequestId,
  cardNumber,
  skipCardValidation = false,
  skipReferenceValidation = false,
}) => {
  await applyLateFeeIfNeeded(bill);

  if (bill.status === "cancelled") return { error: "This bill has been cancelled." };
  if (bill.balanceAmount <= 0) return { error: "This bill is already fully paid." };
  if (!(amount > 0)) return { error: "Amount must be greater than 0." };
  if (amount > bill.balanceAmount) return { error: "Amount must not exceed remaining balance." };
  if (!allowedPaymentMethods.includes(paymentMethod)) return { error: "Valid payment method is required." };
  if (!paymentDate) return { error: "Valid payment date is required." };
  if (!skipCardValidation && paymentMethod === "card" && !isValidCardNumber(cardNumber)) {
    return { error: "Card number format is invalid." };
  }
  if (
    !skipReferenceValidation &&
    paymentMethod === "online" &&
    !String(referenceNumber || "").trim()
  ) {
    return { error: "Reference number is required for online payments." };
  }
  if (clientRequestId) {
    const duplicateRequest = await Payment.findOne({ clientRequestId });
    if (duplicateRequest) return { error: "Duplicate payment submission detected." };
  }
  if (referenceNumber) {
    const duplicateReference = await Payment.findOne({
      student: student._id,
      bill: bill._id,
      referenceNumber: String(referenceNumber).trim(),
      status: "success",
    });
    if (duplicateReference) return { error: "Duplicate payment reference detected." };
  }

  return { balanceBefore: roundMoney(bill.balanceAmount) };
};

const validateBillInput = (body) => {
  const errors = [];
  const amount = Number(body.amount);
  const dueDate = parseDate(body.dueDate);
  const periodYear = Number(body.periodYear || new Date().getFullYear());
  const periodMonth =
    body.periodMonth === null || body.periodMonth === undefined || body.periodMonth === ""
      ? null
      : Number(body.periodMonth);

  if (!body.title || !String(body.title).trim()) errors.push("Bill title is required.");
  if (!allowedBillTypes.includes(body.billType)) errors.push("Valid bill type is required.");
  if (!allowedCycles.includes(body.billingCycle)) errors.push("Valid billing cycle is required.");
  if (!(amount > 0)) errors.push("Amount must be greater than 0.");
  if (!dueDate) errors.push("Valid due date is required.");
  if (!periodYear) errors.push("Valid period year is required.");
  if (periodMonth !== null && (periodMonth < 1 || periodMonth > 12)) {
    errors.push("Period month must be between 1 and 12.");
  }

  return {
    errors,
    payload: {
      title: String(body.title || "").trim(),
      billType: body.billType,
      billingCycle: body.billingCycle,
      amount: roundMoney(amount),
      dueDate,
      periodYear,
      periodMonth,
      roomLabel: String(body.roomLabel || "").trim(),
      flowLabel: String(body.flowLabel || "").trim(),
      description: String(body.description || "").trim(),
      lateFeeType: body.lateFeeType || "none",
      lateFeeValue: roundMoney(Number(body.lateFeeValue || 0)),
    },
  };
};

const projectBill = async (bill) => {
  await applyLateFeeIfNeeded(bill);
  return bill.toObject ? bill.toObject() : bill;
};

const createBillDocument = async ({
  student,
  feeStructure,
  title,
  billType,
  billingCycle,
  amount,
  dueDate,
  periodMonth,
  periodYear,
  roomLabel,
  flowLabel,
  description,
  lateFeeType,
  lateFeeValue,
  createdBy,
}) => {
  const duplicate = await StudentBill.findOne({
    student: student._id,
    title,
    billType,
    periodMonth,
    periodYear,
    status: { $ne: "cancelled" },
  });

  if (duplicate) {
    return { skipped: true, reason: "duplicate", bill: duplicate };
  }

  const bill = await StudentBill.create({
    student: student._id,
    feeStructure: feeStructure ? feeStructure._id : null,
    title,
    billType,
    billingCycle,
    periodMonth,
    periodYear,
    dueDate,
    roomLabel,
    flowLabel,
    baseAmount: amount,
    lateFeeType,
    lateFeeValue,
    totalAmount: amount,
    balanceAmount: amount,
    description,
    createdBy,
  });

  return { skipped: false, bill };
};

const processPayment = async ({
  student,
  bill,
  amount,
  paymentMethod,
  paymentDate,
  referenceNumber,
  note,
  clientRequestId,
  cardNumber,
  adminRecordedBy,
}) => {
  const validation = await validatePaymentRequest({
    student,
    bill,
    amount,
    paymentMethod,
    paymentDate,
    referenceNumber,
    clientRequestId,
    cardNumber,
  });
  if (validation.error) return { error: validation.error };

  const balanceBefore = validation.balanceBefore;
  const payment = await Payment.create({
    paymentId: generateCode("PAY"),
    transactionId: generateCode("TXN"),
    clientRequestId: clientRequestId || undefined,
    student: student._id,
    bill: bill._id,
    amount,
    paymentMethod,
    referenceNumber: String(referenceNumber || "").trim(),
    cardLast4:
      paymentMethod === "card" ? String(cardNumber).replace(/\D/g, "").slice(-4) : "",
    paymentDate,
    status: "pending",
    paymentGateway: "manual",
    note: String(note || "").trim(),
    adminRecordedBy: adminRecordedBy || "",
    receiptNumber: generateCode("RCT"),
    billSnapshot: {
      title: bill.title,
      billType: bill.billType,
      dueDate: bill.dueDate,
      balanceBefore,
      balanceAfter: roundMoney(balanceBefore - amount),
      totalAmount: bill.totalAmount,
    },
    statusTrail: [{ status: "pending", note: "Payment created." }],
  });

  payment.status = "processing";
  payment.statusTrail.push({ status: "processing", note: "Payment processing started." });
  await payment.save();

  bill.paidAmount = roundMoney((bill.paidAmount || 0) + amount);
  syncBillAmounts(bill);
  await bill.save();

  payment.status = "success";
  payment.statusTrail.push({ status: "success", note: "Payment processed successfully." });
  payment.billSnapshot.balanceAfter = bill.balanceAmount;
  await payment.save();

  await notifyGeneral(
    student._id,
    "Payment Confirmed",
    `Payment of LKR ${amount.toFixed(2)} for ${bill.title} was received successfully on ${paymentDate.toLocaleDateString("en-GB")}.`
  );

  return { payment, bill };
};

const createStripePaymentRecord = async ({
  student,
  bill,
  amount,
  paymentDate,
  note,
  clientRequestId,
}) => {
  const validation = await validatePaymentRequest({
    student,
    bill,
    amount,
    paymentMethod: "card",
    paymentDate,
    clientRequestId,
    skipCardValidation: true,
    skipReferenceValidation: true,
  });
  if (validation.error) return { error: validation.error };

  const payment = await Payment.create({
    paymentId: generateCode("PAY"),
    transactionId: generateCode("TXN"),
    clientRequestId: clientRequestId || undefined,
    student: student._id,
    bill: bill._id,
    amount,
    paymentMethod: "card",
    paymentGateway: "stripe",
    paymentDate,
    status: "pending",
    note: String(note || "").trim(),
    receiptNumber: generateCode("RCT"),
    billSnapshot: {
      title: bill.title,
      billType: bill.billType,
      dueDate: bill.dueDate,
      balanceBefore: validation.balanceBefore,
      balanceAfter: roundMoney(validation.balanceBefore - amount),
      totalAmount: bill.totalAmount,
    },
    statusTrail: [{ status: "pending", note: "Stripe checkout session created." }],
  });

  return { payment };
};

const finalizeStripePayment = async ({ payment, paymentIntentId, sessionId, customerEmail }) => {
  if (!payment) return { error: "Payment record not found." };
  if (payment.status === "success") {
    const existingBill = await StudentBill.findById(payment.bill);
    return { payment, bill: existingBill };
  }

  const bill = await StudentBill.findById(payment.bill);
  const student = await Student.findById(payment.student);
  if (!bill || !student) return { error: "Payment record is missing related data." };

  await applyLateFeeIfNeeded(bill);

  payment.status = "processing";
  payment.statusTrail.push({ status: "processing", note: "Stripe payment verified." });
  if (paymentIntentId) payment.gatewayPaymentIntentId = paymentIntentId;
  if (sessionId) payment.gatewaySessionId = sessionId;
  if (customerEmail) payment.gatewayCustomerEmail = customerEmail;

  bill.paidAmount = roundMoney((bill.paidAmount || 0) + payment.amount);
  syncBillAmounts(bill);
  await bill.save();

  payment.status = "success";
  payment.referenceNumber = payment.referenceNumber || paymentIntentId || sessionId || "";
  payment.transactionId = paymentIntentId || sessionId || payment.transactionId;
  payment.billSnapshot.balanceAfter = bill.balanceAmount;
  payment.statusTrail.push({ status: "success", note: "Stripe payment completed successfully." });
  await payment.save();

  await notifyGeneral(
    student._id,
    "Payment Confirmed",
    `Payment of LKR ${payment.amount.toFixed(2)} for ${bill.title} was received successfully on ${payment.paymentDate.toLocaleDateString(
      "en-GB"
    )}.`
  );

  return { payment, bill, student };
};

const failStripePayment = async ({ payment, reason, paymentIntentId, sessionId }) => {
  if (!payment || payment.status === "success" || payment.status === "failed") return payment;

  payment.status = "failed";
  payment.failureReason = String(reason || "Stripe payment failed.").trim();
  if (paymentIntentId) payment.gatewayPaymentIntentId = paymentIntentId;
  if (sessionId) payment.gatewaySessionId = sessionId;
  payment.statusTrail.push({ status: "failed", note: payment.failureReason });
  await payment.save();
  return payment;
};

exports.getStudentFeeSummary = async (req, res) => {
  try {
    const summary = await getStudentFinancialSummary(req.student._id);
    res.json(summary);
  } catch (error) {
    console.error("getStudentFeeSummary error:", error);
    res.status(500).json({ message: "Failed to load payment summary." });
  }
};

exports.getStudentBills = async (req, res) => {
  try {
    const { status, year, month, billType } = req.query;
    const query = { student: req.student._id };
    if (status && status !== "all") query.status = status;
    if (year) query.periodYear = Number(year);
    if (month) query.periodMonth = Number(month);
    if (billType && billType !== "all") query.billType = billType;

    const bills = await StudentBill.find(query).sort({ dueDate: -1, createdAt: -1 });
    const normalized = [];
    for (const bill of bills) normalized.push(await projectBill(bill));
    res.json({ bills: normalized });
  } catch (error) {
    console.error("getStudentBills error:", error);
    res.status(500).json({ message: "Failed to load bills." });
  }
};

exports.getStudentPayments = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const query = { student: req.student._id };
    if (status && status !== "all") query.status = status;
    if (from || to) {
      query.paymentDate = {};
      if (from) query.paymentDate.$gte = new Date(from);
      if (to) query.paymentDate.$lte = new Date(to);
    }
    const payments = await Payment.find(query)
      .populate("bill", "title billType dueDate totalAmount balanceAmount status")
      .sort({ paymentDate: -1, createdAt: -1 })
      .lean();
    res.json({ payments });
  } catch (error) {
    console.error("getStudentPayments error:", error);
    res.status(500).json({ message: "Failed to load payment history." });
  }
};

exports.createStudentPayment = async (req, res) => {
  try {
    const {
      billId,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      note,
      clientRequestId,
      cardNumber,
    } = req.body;

    if (!billId) return res.status(400).json({ message: "Bill is required." });

    const bill = await StudentBill.findOne({ _id: billId, student: req.student._id });
    if (!bill) return res.status(404).json({ message: "Bill not found." });

    const result = await processPayment({
      student: req.student,
      bill,
      amount: roundMoney(Number(amount)),
      paymentMethod,
      paymentDate: parseDate(paymentDate),
      referenceNumber,
      note,
      clientRequestId,
      cardNumber,
    });

    if (result.error) return res.status(400).json({ message: result.error });

    const summary = await getStudentFinancialSummary(req.student._id);
    res.status(201).json({
      message: "Payment completed successfully.",
      payment: result.payment,
      bill: result.bill,
      summary: summary.totals,
    });
  } catch (error) {
    console.error("createStudentPayment error:", error);
    res.status(500).json({ message: "Failed to process payment." });
  }
};

exports.createStripeCheckoutSession = async (req, res) => {
  try {
    ensureStripeConfigured();

    const { billId, amount, paymentDate, note, clientRequestId, successUrl, cancelUrl } = req.body;
    if (!billId) return res.status(400).json({ message: "Bill is required." });

    const bill = await StudentBill.findOne({ _id: billId, student: req.student._id });
    if (!bill) return res.status(404).json({ message: "Bill not found." });

    const result = await createStripePaymentRecord({
      student: req.student,
      bill,
      amount: roundMoney(Number(amount)),
      paymentDate: parseDate(paymentDate),
      note,
      clientRequestId,
    });

    if (result.error) return res.status(400).json({ message: result.error });

    const origin = String(successUrl || cancelUrl || frontendBaseUrl).split("?")[0];
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}?stripe_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${String(cancelUrl || successUrl || frontendBaseUrl).split("?")[0]}?stripe_payment=cancelled`,
      customer_email: req.student.email || undefined,
      metadata: {
        paymentRecordId: String(result.payment._id),
        billId: String(bill._id),
        studentId: String(req.student._id),
      },
      payment_intent_data: {
        metadata: {
          paymentRecordId: String(result.payment._id),
          billId: String(bill._id),
          studentId: String(req.student._id),
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "lkr",
            unit_amount: toStripeAmount(result.payment.amount),
            product_data: {
              name: bill.title,
              description:
                bill.description || `${billTypeLabels[bill.billType] || bill.billType} payment`,
            },
          },
        },
      ],
    });

    result.payment.gatewaySessionId = session.id;
    if (session.payment_intent) {
      result.payment.gatewayPaymentIntentId = String(session.payment_intent);
    }
    result.payment.statusTrail.push({
      status: "processing",
      note: "Redirected to Stripe Checkout.",
    });
    await result.payment.save();

    res.status(201).json({
      message: "Stripe checkout session created.",
      sessionId: session.id,
      checkoutUrl: session.url,
      paymentId: result.payment.paymentId,
    });
  } catch (error) {
    console.error("createStripeCheckoutSession error:", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "Duplicate payment record detected. Please refresh and try again.",
        details: error.keyPattern || error.keyValue || null,
      });
    }
    const stripeMessage = error?.raw?.message || error?.message || "Failed to start Stripe checkout.";
    res.status(error.statusCode || 500).json({ message: stripeMessage });
  }
};

exports.verifyStripeCheckoutSession = async (req, res) => {
  try {
    ensureStripeConfigured();

    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ["payment_intent"],
    });
    const payment = await Payment.findOne({
      gatewaySessionId: session.id,
      student: req.student._id,
    });
    if (!payment) return res.status(404).json({ message: "Payment session not found." });

    if (session.payment_status === "paid") {
      const result = await finalizeStripePayment({
        payment,
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        customerEmail: session.customer_details?.email || session.customer_email || "",
      });
      if (result.error) return res.status(400).json({ message: result.error });

      const summary = await getStudentFinancialSummary(req.student._id);
      return res.json({
        message: "Stripe payment verified successfully.",
        payment: result.payment,
        bill: result.bill,
        summary: summary.totals,
      });
    }

    if (session.status === "expired") {
      await failStripePayment({
        payment,
        reason: "Stripe checkout session expired.",
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
      });
    }

    res.status(400).json({ message: "Stripe session has not completed payment yet." });
  } catch (error) {
    console.error("verifyStripeCheckoutSession error:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Failed to verify Stripe session." });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  try {
    ensureStripeConfigured();

    const signature = req.headers["stripe-signature"];
    let event = null;
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = req.body;
    }

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const payment = await Payment.findOne({ gatewaySessionId: session.id });
      if (payment) {
        await finalizeStripePayment({
          payment,
          sessionId: session.id,
          paymentIntentId: String(session.payment_intent || ""),
          customerEmail: session.customer_details?.email || session.customer_email || "",
        });
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      const payment = await Payment.findOne({ gatewaySessionId: session.id });
      if (payment) {
        await failStripePayment({
          payment,
          sessionId: session.id,
          paymentIntentId: String(session.payment_intent || ""),
          reason: event.type === "checkout.session.expired"
            ? "Stripe checkout session expired."
            : "Stripe checkout payment failed.",
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("handleStripeWebhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

exports.getFeeStructures = async (_req, res) => {
  try {
    const structures = await FeeStructure.find()
      .populate("assignedStudents", "studentId fullName email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ structures });
  } catch (error) {
    console.error("getFeeStructures error:", error);
    res.status(500).json({ message: "Failed to load fee structures." });
  }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const amount = roundMoney(Number(req.body.amount));
    const assignedStudentIds = Array.isArray(req.body.assignedStudentIds)
      ? req.body.assignedStudentIds.filter(Boolean)
      : [];
    if (!req.body.title || !String(req.body.title).trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!allowedBillTypes.includes(req.body.feeType)) {
      return res.status(400).json({ message: "Valid fee type is required." });
    }
    if (!allowedCycles.includes(req.body.billingCycle)) {
      return res.status(400).json({ message: "Valid billing cycle is required." });
    }
    if (!(amount > 0)) {
      return res.status(400).json({ message: "Amount must be greater than 0." });
    }

    const structure = await FeeStructure.create({
      title: String(req.body.title).trim(),
      feeType: req.body.feeType,
      billingCycle: req.body.billingCycle,
      amount,
      dueDay: Number(req.body.dueDay || 10),
      lateFeeType: req.body.lateFeeType || "none",
      lateFeeValue: roundMoney(Number(req.body.lateFeeValue || 0)),
      roomLabel: String(req.body.roomLabel || "").trim(),
      flowLabel: String(req.body.flowLabel || "").trim(),
      description: String(req.body.description || "").trim(),
      assignedStudents: assignedStudentIds,
      isActive: req.body.isActive !== false,
      createdBy: req.admin?.name || "admin",
    });

    res.status(201).json({ message: "Fee structure created.", structure });
  } catch (error) {
    console.error("createFeeStructure error:", error);
    res.status(500).json({ message: "Failed to create fee structure." });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) return res.status(404).json({ message: "Fee structure not found." });

    const amount =
      req.body.amount === undefined ? structure.amount : roundMoney(Number(req.body.amount));
    if (!(amount > 0)) return res.status(400).json({ message: "Amount must be greater than 0." });

    if (req.body.title !== undefined) structure.title = String(req.body.title).trim();
    if (req.body.feeType !== undefined) structure.feeType = req.body.feeType;
    if (req.body.billingCycle !== undefined) structure.billingCycle = req.body.billingCycle;
    structure.amount = amount;
    if (req.body.dueDay !== undefined) structure.dueDay = Number(req.body.dueDay);
    if (req.body.lateFeeType !== undefined) structure.lateFeeType = req.body.lateFeeType;
    if (req.body.lateFeeValue !== undefined) {
      structure.lateFeeValue = roundMoney(Number(req.body.lateFeeValue));
    }
    if (req.body.roomLabel !== undefined) structure.roomLabel = String(req.body.roomLabel).trim();
    if (req.body.flowLabel !== undefined) structure.flowLabel = String(req.body.flowLabel).trim();
    if (req.body.description !== undefined) {
      structure.description = String(req.body.description).trim();
    }
    if (req.body.assignedStudentIds !== undefined) {
      structure.assignedStudents = Array.isArray(req.body.assignedStudentIds)
        ? req.body.assignedStudentIds.filter(Boolean)
        : [];
    }
    if (req.body.isActive !== undefined) structure.isActive = req.body.isActive !== false;

    await structure.save();
    res.json({ message: "Fee structure updated.", structure });
  } catch (error) {
    console.error("updateFeeStructure error:", error);
    res.status(500).json({ message: "Failed to update fee structure." });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!structure) return res.status(404).json({ message: "Fee structure not found." });
    res.json({ message: "Fee structure removed." });
  } catch (error) {
    console.error("deleteFeeStructure error:", error);
    res.status(500).json({ message: "Failed to delete fee structure." });
  }
};

exports.generateBills = async (req, res) => {
  try {
    const {
      feeStructureId,
      studentIds,
      title,
      billType,
      billingCycle,
      amount,
      dueDate,
      periodMonth,
      periodYear,
      roomLabel,
      flowLabel,
      description,
      lateFeeType,
      lateFeeValue,
    } = req.body;

    let structure = null;
    let payload = null;

    if (feeStructureId) {
      structure = await FeeStructure.findById(feeStructureId);
      if (!structure) {
        return res.status(404).json({ message: "Fee structure not found." });
      }
      payload = {
        title: structure.title,
        billType: structure.feeType,
        billingCycle: structure.billingCycle,
        amount: structure.amount,
        dueDate:
          parseDate(dueDate) ||
          new Date(
            Number(periodYear || new Date().getFullYear()),
            Number(periodMonth || 1) - 1,
            structure.dueDay || 10
          ),
        periodMonth:
          periodMonth === undefined || periodMonth === ""
            ? new Date().getMonth() + 1
            : Number(periodMonth),
        periodYear: Number(periodYear || new Date().getFullYear()),
        roomLabel: String(roomLabel !== undefined ? roomLabel : structure.roomLabel || ""),
        flowLabel: String(flowLabel !== undefined ? flowLabel : structure.flowLabel || ""),
        description: String(description !== undefined ? description : structure.description || ""),
        lateFeeType: lateFeeType || structure.lateFeeType,
        lateFeeValue:
          lateFeeValue === undefined ? structure.lateFeeValue : roundMoney(Number(lateFeeValue)),
      };
    } else {
      const validated = validateBillInput({
        title,
        billType,
        billingCycle,
        amount,
        dueDate,
        periodMonth,
        periodYear,
        roomLabel,
        flowLabel,
        description,
        lateFeeType,
        lateFeeValue,
      });
      if (validated.errors.length) {
        return res.status(400).json({ message: validated.errors.join(" ") });
      }
      payload = validated.payload;
    }

    const targetStudentIds =
      studentIds && studentIds.length
        ? studentIds
        : structure && Array.isArray(structure.assignedStudents) && structure.assignedStudents.length
          ? structure.assignedStudents
          : null;

    const students = await Student.find(
      targetStudentIds
        ? { _id: { $in: targetStudentIds }, isActive: true }
        : { isActive: true }
    );

    if (!students.length) {
      return res.status(400).json({ message: "No active students selected." });
    }

    const created = [];
    const skipped = [];

    for (const student of students) {
      const result = await createBillDocument({
        student,
        feeStructure: structure,
        ...payload,
        createdBy: req.admin?.name || "admin",
      });

      if (result.skipped) {
        skipped.push({
          studentId: student.studentId,
          studentName: student.fullName,
          reason: "Duplicate bill exists for this period.",
        });
      } else {
        created.push(result.bill);
        await notifyFeeReminder(student._id, payload.dueDate.toLocaleDateString("en-GB"));
      }
    }

    res.status(201).json({
      message: `Generated ${created.length} bill(s).`,
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("generateBills error:", error);
    res.status(500).json({ message: "Failed to generate bills." });
  }
};

exports.getAdminBills = async (req, res) => {
  try {
    const { status, search, year, month, billType, block } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (year) query.periodYear = Number(year);
    if (month) query.periodMonth = Number(month);
    if (billType && billType !== "all") query.billType = billType;
    if (block && block !== "all") {
      const { studentIds } = await getConfirmedBlockBookings(block);
      query.student = { $in: studentIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    const bills = await StudentBill.find(query)
      .populate("student", "studentId fullName email department yearSemester")
      .sort({ dueDate: -1, createdAt: -1 });

    const normalized = [];
    for (const bill of bills) {
      await applyLateFeeIfNeeded(bill);
      normalized.push(bill.toObject());
    }

    const filtered = search
      ? normalized.filter((bill) => {
          const haystack = [
            bill.title,
            bill.billType,
            bill.student?.fullName,
            bill.student?.email,
            bill.student?.studentId,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(String(search).toLowerCase());
        })
      : normalized;

    res.json({ bills: filtered });
  } catch (error) {
    console.error("getAdminBills error:", error);
    res.status(500).json({ message: "Failed to load bills." });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await StudentBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });
    if (bill.status === "paid") return res.status(400).json({ message: "Paid bills cannot be edited." });

    if (req.body.title !== undefined) bill.title = String(req.body.title).trim();
    if (req.body.dueDate !== undefined) {
      const dueDate = parseDate(req.body.dueDate);
      if (!dueDate) return res.status(400).json({ message: "Valid due date is required." });
      bill.dueDate = dueDate;
    }
    if (req.body.baseAmount !== undefined) {
      const baseAmount = roundMoney(Number(req.body.baseAmount));
      if (!(baseAmount > 0)) return res.status(400).json({ message: "Amount must be greater than 0." });
      bill.baseAmount = baseAmount;
      bill.isPenaltyApplied = false;
      bill.lateFeeAmount = 0;
    }
    if (req.body.lateFeeType !== undefined) bill.lateFeeType = req.body.lateFeeType;
    if (req.body.lateFeeValue !== undefined) {
      bill.lateFeeValue = roundMoney(Number(req.body.lateFeeValue));
      bill.isPenaltyApplied = false;
      bill.lateFeeAmount = 0;
    }
    if (req.body.status === "cancelled") {
      bill.status = "cancelled";
      bill.cancelReason = String(req.body.cancelReason || "Cancelled by admin.").trim();
    }
    if (req.body.roomLabel !== undefined) bill.roomLabel = String(req.body.roomLabel).trim();
    if (req.body.flowLabel !== undefined) bill.flowLabel = String(req.body.flowLabel).trim();
    if (req.body.description !== undefined) bill.description = String(req.body.description).trim();

    syncBillAmounts(bill);
    await bill.save();
    res.json({ message: "Bill updated successfully.", bill });
  } catch (error) {
    console.error("updateBill error:", error);
    res.status(500).json({ message: "Failed to update bill." });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const paymentCount = await Payment.countDocuments({
      bill: req.params.id,
      status: "success",
    });
    if (paymentCount > 0) {
      return res
        .status(400)
        .json({ message: "Bills with successful payments cannot be removed." });
    }
    const bill = await StudentBill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });
    await Payment.deleteMany({ bill: req.params.id, status: { $ne: "success" } });
    res.json({ message: "Bill removed successfully." });
  } catch (error) {
    console.error("deleteBill error:", error);
    res.status(500).json({ message: "Failed to delete bill." });
  }
};

exports.recordAdminPayment = async (req, res) => {
  try {
    const {
      studentId,
      billId,
      amount,
      paymentMethod,
      referenceNumber,
      paymentDate,
      note,
      cardNumber,
      clientRequestId,
    } = req.body;

    if (!studentId || !billId) {
      return res.status(400).json({ message: "Student and bill are required." });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found." });

    const bill = await StudentBill.findOne({ _id: billId, student: student._id });
    if (!bill) return res.status(404).json({ message: "Bill not found for this student." });

    const result = await processPayment({
      student,
      bill,
      amount: roundMoney(Number(amount)),
      paymentMethod,
      paymentDate: parseDate(paymentDate),
      referenceNumber,
      note,
      clientRequestId,
      cardNumber,
      adminRecordedBy: req.admin?.name || "admin",
    });

    if (result.error) return res.status(400).json({ message: result.error });

    res.status(201).json({
      message: "Payment recorded successfully.",
      payment: result.payment,
      bill: result.bill,
    });
  } catch (error) {
    console.error("recordAdminPayment error:", error);
    res.status(500).json({ message: "Failed to record payment." });
  }
};

exports.deleteAdminPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    if (payment.status === "success") {
      const bill = await StudentBill.findById(payment.bill);
      if (!bill) {
        return res.status(400).json({ message: "Related bill not found for this payment." });
      }

      bill.paidAmount = roundMoney(Math.max(0, (bill.paidAmount || 0) - (payment.amount || 0)));
      syncBillAmounts(bill);
      await bill.save();
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment entry removed successfully." });
  } catch (error) {
    console.error("deleteAdminPayment error:", error);
    res.status(500).json({ message: "Failed to remove payment entry." });
  }
};

exports.getAdminStudentsFinancials = async (req, res) => {
  try {
    const { search, status, block } = req.query;
    const blockInfo =
      block && block !== "all"
        ? await getConfirmedBlockBookings(block)
        : { block: null, bookings: [], studentIds: [] };

    const studentQuery =
      blockInfo.block
        ? { _id: { $in: blockInfo.studentIds.map((id) => new mongoose.Types.ObjectId(id)) } }
        : {};

    const students = await Student.find(studentQuery).sort({ createdAt: -1 }).lean();
    const bills = await StudentBill.find(
      blockInfo.block
        ? { student: { $in: blockInfo.studentIds.map((id) => new mongoose.Types.ObjectId(id)) } }
        : {}
    )
      .populate("student", "studentId fullName email")
      .sort({ dueDate: -1 })
      .lean();
    const payments = await Payment.find(
      blockInfo.block
        ? { status: "success", student: { $in: blockInfo.studentIds.map((id) => new mongoose.Types.ObjectId(id)) } }
        : { status: "success" }
    ).lean();

    const bookingMap = new Map(
      blockInfo.bookings.map((booking) => [
        String(booking.student?._id || booking.student),
        { block: booking.block, roomNumber: booking.roomNumber, bookingId: booking._id },
      ])
    );

    const map = new Map();
    for (const student of students) {
      map.set(String(student._id), {
        student,
        block: bookingMap.get(String(student._id))?.block || null,
        roomNumber: bookingMap.get(String(student._id))?.roomNumber || "",
        totalFees: 0,
        totalPaid: 0,
        remainingBalance: 0,
        overdueBills: 0,
        latestDueDate: null,
      });
    }

    for (const bill of bills) {
      const key = String(bill.student?._id || bill.student);
      if (!map.has(key)) continue;
      const row = map.get(key);
      row.totalFees = roundMoney(row.totalFees + (bill.totalAmount || 0));
      row.remainingBalance = roundMoney(row.remainingBalance + (bill.balanceAmount || 0));
      if (bill.status === "overdue") row.overdueBills += 1;
      if (!row.latestDueDate || new Date(bill.dueDate) > new Date(row.latestDueDate)) {
        row.latestDueDate = bill.dueDate;
      }
    }

    for (const payment of payments) {
      const key = String(payment.student);
      if (!map.has(key)) continue;
      const row = map.get(key);
      row.totalPaid = roundMoney(row.totalPaid + (payment.amount || 0));
    }

    let rows = Array.from(map.values());
    if (status && status !== "all") {
      rows = rows.filter((row) => {
        if (status === "overdue") return row.overdueBills > 0;
        if (status === "paid") return row.remainingBalance <= 0 && row.totalFees > 0;
        if (status === "unpaid") return row.remainingBalance > 0;
        return true;
      });
    }
    if (search) {
      const q = String(search).toLowerCase();
      rows = rows.filter((row) =>
        [row.student.fullName, row.student.email, row.student.studentId]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    const summary = {
      block: blockInfo.block || "all",
      totalStudents: rows.length,
      totalBilled: roundMoney(rows.reduce((sum, row) => sum + row.totalFees, 0)),
      totalPaid: roundMoney(rows.reduce((sum, row) => sum + row.totalPaid, 0)),
      totalOutstanding: roundMoney(rows.reduce((sum, row) => sum + row.remainingBalance, 0)),
      overdueCount: rows.reduce((sum, row) => sum + row.overdueBills, 0),
    };

    res.json({ students: rows, summary });
  } catch (error) {
    console.error("getAdminStudentsFinancials error:", error);
    res.status(500).json({ message: "Failed to load student financials." });
  }
};

exports.getStudentSummaryByAdmin = async (req, res) => {
  try {
    const lookupValue = String(req.params.studentId || "").trim();
    const lookupQuery = mongoose.Types.ObjectId.isValid(lookupValue)
      ? { $or: [{ _id: lookupValue }, { studentId: lookupValue }] }
      : { studentId: lookupValue };

    const student = await Student.findOne(lookupQuery);
    if (!student) return res.status(404).json({ message: "Student not found." });

    const summary = await getStudentFinancialSummary(student._id);
    res.json({ student, ...summary });
  } catch (error) {
    console.error("getStudentSummaryByAdmin error:", error);
    res.status(500).json({ message: "Failed to load student summary." });
  }
};

exports.getAdminReports = async (req, res) => {
  try {
    const month = req.query.month ? Number(req.query.month) : null;
    const year = req.query.year ? Number(req.query.year) : null;
    const block = req.query.block;

    const billQuery = {};
    const paymentQuery = { status: "success" };

    if (year) {
      billQuery.periodYear = year;
      paymentQuery.paymentDate = {
        ...(paymentQuery.paymentDate || {}),
        $gte: new Date(year, month ? month - 1 : 0, 1),
        $lte: new Date(year, month ? month : 12, 0, 23, 59, 59, 999),
      };
    }
    if (month) billQuery.periodMonth = month;

    let blockInfo = { block: null, studentIds: [] };
    if (block && block !== "all") {
      blockInfo = await getConfirmedBlockBookings(block);
      const objectIds = blockInfo.studentIds.map((id) => new mongoose.Types.ObjectId(id));
      billQuery.student = { $in: objectIds };
      paymentQuery.student = { $in: objectIds };
    }

    const [bills, payments] = await Promise.all([
      StudentBill.find(billQuery).populate("student", "studentId fullName").lean(),
      Payment.find(paymentQuery).populate("student", "studentId fullName").lean(),
    ]);

    const totalBilled = roundMoney(bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0));
    const totalCollected = roundMoney(
      payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    );
    const totalOutstanding = roundMoney(
      bills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0)
    );
    const overdueCount = bills.filter((bill) => bill.status === "overdue").length;

    const byType = allowedBillTypes.map((type) => ({
      type,
      total: roundMoney(
        bills
          .filter((bill) => bill.billType === type)
          .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)
      ),
      paid: roundMoney(
        bills
          .filter((bill) => bill.billType === type)
          .reduce((sum, bill) => sum + (bill.paidAmount || 0), 0)
      ),
      balance: roundMoney(
        bills
          .filter((bill) => bill.billType === type)
          .reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0)
      ),
    }));

    const monthlyCollectionsMap = {};
    for (const payment of payments) {
      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyCollectionsMap[key]) monthlyCollectionsMap[key] = 0;
      monthlyCollectionsMap[key] = roundMoney(monthlyCollectionsMap[key] + (payment.amount || 0));
    }

    res.json({
      block: blockInfo.block || "all",
      totals: { totalBilled, totalCollected, totalOutstanding, overdueCount },
      byType,
      monthlyCollections: Object.entries(monthlyCollectionsMap).map(([period, amount]) => ({
        period,
        amount,
      })),
      bills,
      payments,
    });
  } catch (error) {
    console.error("getAdminReports error:", error);
    res.status(500).json({ message: "Failed to generate reports." });
  }
};

exports.sendOverdueReminders = async (_req, res) => {
  try {
    const overdueBills = await StudentBill.find({ status: "overdue" }).populate(
      "student",
      "_id fullName"
    );

    for (const bill of overdueBills) {
      await notifyGeneral(
        bill.student._id,
        "Overdue Payment Reminder",
        `${bill.title} is overdue. Outstanding balance: LKR ${bill.balanceAmount.toFixed(
          2
        )}. Please settle the bill as soon as possible.`
      );
    }

    res.json({
      message: `Sent overdue reminders for ${overdueBills.length} bill(s).`,
      count: overdueBills.length,
    });
  } catch (error) {
    console.error("sendOverdueReminders error:", error);
    res.status(500).json({ message: "Failed to send reminders." });
  }
};
