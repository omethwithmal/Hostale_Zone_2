const mongoose = require("mongoose");

const { Schema } = mongoose;

function generateBillId() {
  return `BILL-${Date.now().toString().slice(-8)}-${Math.floor(
    100 + Math.random() * 900
  )}`;
}

const additionalFeeSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const studentBillSchema = new Schema(
  {
    billId: {
      type: String,
      unique: true,
      default: generateBillId,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Register",
      required: true,
      index: true,
    },
    feeProfile: {
      type: Schema.Types.ObjectId,
      ref: "FeeProfile",
      default: null,
    },
    billMonth: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    studentSnapshot: {
      itNumber: { type: String, trim: true, default: "" },
      fullName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
    },
    roomSnapshot: {
      roomId: { type: String, trim: true, default: "" },
      roomNumber: { type: String, trim: true, default: "" },
      block: { type: String, trim: true, default: "" },
    },
    breakdown: {
      roomPrice: {
        type: Number,
        min: 0,
        default: 0,
      },
      currentBill: {
        type: Number,
        min: 0,
        default: 0,
      },
      waterBill: {
        type: Number,
        min: 0,
        default: 0,
      },
      lateFee: {
        type: Number,
        min: 0,
        default: 0,
      },
      additionalFees: {
        type: [additionalFeeSchema],
        default: [],
      },
    },
    totals: {
      subtotal: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        min: 0,
        default: 0,
      },
      paid: {
        type: Number,
        min: 0,
        default: 0,
      },
      outstanding: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "overdue", "cancelled"],
      default: "pending",
      index: true,
    },
    lateFeeApplied: {
      type: Boolean,
      default: false,
    },
    lateFeeAppliedAt: {
      type: Date,
      default: null,
    },
    lastOverdueReminderAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    acceptedPayment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

studentBillSchema.index({ student: 1, billMonth: 1 }, { unique: true });
studentBillSchema.index({ "roomSnapshot.block": 1, billMonth: 1 });
studentBillSchema.index({ "roomSnapshot.roomNumber": 1, status: 1 });

studentBillSchema.pre("save", function updateBillTotals() {
  this.breakdown = this.breakdown || {};
  this.breakdown.additionalFees = this.breakdown.additionalFees || [];
  this.totals = this.totals || {};

  const additionalFeesTotal = this.breakdown.additionalFees.reduce(
    (sum, fee) => sum + (Number(fee.amount) || 0),
    0
  );

  this.totals.subtotal =
    (Number(this.breakdown.roomPrice) || 0) +
    (Number(this.breakdown.currentBill) || 0) +
    (Number(this.breakdown.waterBill) || 0) +
    additionalFeesTotal;

  this.totals.total =
    this.totals.subtotal + (Number(this.breakdown.lateFee) || 0);

  this.totals.outstanding = Math.max(
    (Number(this.totals.total) || 0) - (Number(this.totals.paid) || 0),
    0
  );
});

module.exports = mongoose.model("StudentBill", studentBillSchema);
