const mongoose = require("mongoose");

const { Schema } = mongoose;

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

const feeProfileSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Register",
      required: true,
      unique: true,
    },
    studentSnapshot: {
      itNumber: { type: String, trim: true, default: "" },
      fullName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
    },
    roomDetails: {
      roomId: { type: String, trim: true, default: "" },
      roomNumber: { type: String, trim: true, default: "" },
      block: { type: String, trim: true, default: "" },
      roomPrice: {
        type: Number,
        min: 0,
        default: 0,
      },
      syncWithRoomPrice: {
        type: Boolean,
        default: true,
      },
    },
    charges: {
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
      additionalFees: {
        type: [additionalFeeSchema],
        default: [],
      },
      lateFeeType: {
        type: String,
        enum: ["fixed", "percentage"],
        default: "percentage",
      },
      lateFeeValue: {
        type: Number,
        min: 0,
        default: 5,
      },
      paymentWindowDays: {
        type: Number,
        min: 1,
        default: 30,
      },
    },
    lastPricingTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

feeProfileSchema.pre("save", function updatePricingTotal() {
  this.roomDetails = this.roomDetails || {};
  this.charges = this.charges || {};
  this.charges.additionalFees = this.charges.additionalFees || [];

  const additionalFeesTotal = this.charges.additionalFees.reduce(
    (sum, fee) => sum + (Number(fee.amount) || 0),
    0
  );

  this.lastPricingTotal =
    (Number(this.roomDetails.roomPrice) || 0) +
    (Number(this.charges.currentBill) || 0) +
    (Number(this.charges.waterBill) || 0) +
    additionalFeesTotal;
});

module.exports = mongoose.model("FeeProfile", feeProfileSchema);
