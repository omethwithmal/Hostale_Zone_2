// ==============================
// IMPORT MONGOOSE
// ==============================
const mongoose = require("mongoose");

// ==============================
// STATUS HISTORY SUB-SCHEMA
// This stores complaint status changes
// Example: Pending -> In Progress -> Resolved
// ==============================
const statusHistorySchema = new mongoose.Schema(
  {
    // Complaint status at that moment
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      required: true,
    },

    // Date and time when status changed
    time: {
      type: Date,
      required: true,
    },
  },
  {
    // Prevent automatic _id creation for each history item
    _id: false,
  }
);

// ==============================
// MAIN COMPLAINT SCHEMA
// This defines the structure of a complaint document
// ==============================
const complaintSchema = new mongoose.Schema(
  {
    // Unique complaint ID like CMP-123456
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },

    // Student full name
    studentName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // Student registration/student ID
    studentId: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    // Complaint category
    category: {
      type: String,
      enum: ["Water", "Electricity", "WiFi", "Other"],
      required: true,
    },

    // Hostel block name
    block: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // Room number
    roomNo: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    // Complaint description/details
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 15,
      maxlength: 500,
    },

    // Combined location field
    // Example: "Block A - Room 12"
    hostelOrRoomNo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // Uploaded image path/url
    imageUrl: {
      type: String,
      default: "",
    },

    // Current complaint status
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    // Complaint priority level
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },

    // Assigned technician / responsible person
    assignedTo: {
      type: String,
      default: "",
    },

    // Admin-only internal notes
    internalNotes: {
      type: String,
      default: "",
      maxlength: 1500,
    },

    // Stores all status change history
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    // Date when complaint is resolved
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt
    timestamps: true,
  }
);

// ==============================
// INDEX FOR FASTER SEARCHING
// Helps when checking duplicate complaints
// based on category + location + creation date
// ==============================
complaintSchema.index({ category: 1, hostelOrRoomNo: 1, createdAt: -1 });

// ==============================
// EXPORT MODEL
// ==============================
module.exports = mongoose.model("Complaint", complaintSchema);