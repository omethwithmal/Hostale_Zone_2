const mongoose = require("mongoose");

const { Schema } = mongoose;

function generatePaymentId() {
  return `PAY-${Date.now().toString().slice(-8)}-${Math.floor(
    100 + Math.random() * 900
  )}`;
}

function generateTransactionId() {
  return `TXN-${Date.now().toString().slice(-8)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

const paymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      default: generatePaymentId,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Register",
      required: true,
      index: true,
    },
    bill: {
      type: Schema.Types.ObjectId,
      ref: "StudentBill",
      required: true,
      index: true,
    },
    feeProfile: {
      type: Schema.Types.ObjectId,
      ref: "FeeProfile",
      default: null,
    },
    studentSnapshot: {
      itNumber: { type: String, trim: true, default: "" },
      fullName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
    },
    roomSnapshot: {
      roomNumber: { type: String, trim: true, default: "" },
      block: { type: String, trim: true, default: "" },
    },
    billSnapshot: {
      billMonth: { type: String, trim: true, default: "" },
      dueDate: { type: Date, default: null },
      totalAmount: { type: Number, min: 0, default: 0 },
      outstandingAmount: { type: Number, min: 0, default: 0 },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "Online", "Cash Deposit"],
    },
    transactionId: {
      type: String,
      unique: true,
      default: generateTransactionId,
      index: true,
    },
    status: {
      type: String,
      enum: ["otp_sent", "pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    cardDetails: {
      network: {
        type: String,
        enum: ["", "Visa", "MasterCard"],
        default: "",
      },
      holderName: {
        type: String,
        trim: true,
        default: "",
      },
      last4: {
        type: String,
        trim: true,
        default: "",
      },
      expiryMonth: {
        type: String,
        trim: true,
        default: "",
      },
      expiryYear: {
        type: String,
        trim: true,
        default: "",
      },
    },
    verification: {
      codeHash: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastSentAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },
    receiptUrl: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    adminDecisionBy: {
      type: String,
      trim: true,
      default: "",
    },
    adminDecisionReason: {
      type: String,
      trim: true,
      default: "",
    },
    adminDecisionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ student: 1, status: 1, createdAt: -1 });
paymentSchema.index({ bill: 1, status: 1 });

paymentSchema.pre("save", function ensurePaymentDefaults() {
  this.studentSnapshot = this.studentSnapshot || {};
  this.roomSnapshot = this.roomSnapshot || {};
  this.billSnapshot = this.billSnapshot || {};
  this.cardDetails = this.cardDetails || {};
  this.verification = this.verification || {};
});

module.exports = mongoose.model("Payment", paymentSchema);
