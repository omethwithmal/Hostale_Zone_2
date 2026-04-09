const mongoose = require("mongoose");

const paymentTrailSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    clientRequestId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentBill",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["manual", "stripe"],
      default: "manual",
    },
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },
    gatewaySessionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    gatewayPaymentIntentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    gatewayCustomerEmail: {
      type: String,
      trim: true,
    },
    cardLast4: {
      type: String,
      default: "",
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      default: "pending",
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    receiptNumber: {
      type: String,
      default: "",
      trim: true,
    },
    adminRecordedBy: {
      type: String,
      default: "",
      trim: true,
    },
    billSnapshot: {
      title: String,
      billType: String,
      dueDate: Date,
      balanceBefore: Number,
      balanceAfter: Number,
      totalAmount: Number,
    },
    statusTrail: {
      type: [paymentTrailSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ student: 1, paymentDate: -1 });
paymentSchema.index({ bill: 1, status: 1 });

module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
