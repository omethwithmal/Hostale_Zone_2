// ==========================
// IMPORT REQUIRED PACKAGES
// ==========================
const fs = require("fs"); // File system module - used to create upload folder
const express = require("express"); // Express framework
const path = require("path"); // Path utilities
const multer = require("multer"); // File upload handling
const Complaint = require("../models/Complaint"); // Complaint model

// Create router object
const router = express.Router();

// ==========================
// CONSTANT VALUES
// ==========================

// Allowed complaint categories
const VALID_CATEGORIES = ["Water", "Electricity", "WiFi", "Other"];

// Allowed complaint statuses
const VALID_STATUSES = ["Pending", "In Progress", "Resolved"];

// Allowed image file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Maximum image size = 3MB
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

// ==========================
// VALIDATION REGEX PATTERNS
// ==========================

// Only English letters and spaces
const ENGLISH_LETTERS_AND_SPACES_REGEX = /^[A-Za-z\s]+$/;

// Only numbers for room number
const ROOM_NUMBER_REGEX = /^[0-9]+$/;

// Student ID must contain at least one letter and one number
const STUDENT_ID_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/;

// ==========================
// UPLOAD FOLDER SETUP
// ==========================

// Create upload directory path
const uploadDir = path.join(__dirname, "../../Uploads/complaints");

// Create folder if it does not exist
fs.mkdirSync(uploadDir, { recursive: true });

// ==========================
// MULTER STORAGE CONFIG
// ==========================
const storage = multer.diskStorage({
  // Set upload destination folder
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  // Rename uploaded file with timestamp + safe filename
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

// ==========================
// FILE FILTER
// ==========================

// Check whether uploaded file type is allowed
function fileFilter(req, file, cb) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only png, jpg, jpeg and webp files are allowed"));
  }
  cb(null, true);
}

// ==========================
// MULTER INSTANCE
// ==========================
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

// ==========================
// HELPER FUNCTIONS
// ==========================

// Build image URL path for frontend/backend access
function buildImageUrl(req) {
  if (!req.file) return "";
  return `/uploads/complaints/${req.file.filename}`;
}

// Remove extra spaces and safely convert value to string
function normalizeText(value) {
  return String(value || "").trim();
}

// Validate uploaded image type and size
function validateImage(file) {
  if (!file) return null;

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return "Only JPG, JPEG, PNG, and WEBP images are allowed";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must be less than 3MB";
  }

  return null;
}

// Generate random complaint ID like CMP-123456
function generateComplaintId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CMP-${random}`;
}

// Set base priority according to category
function basePriorityFromCategory(category) {
  if (category === "Water" || category === "Electricity") return "High";
  if (category === "WiFi") return "Medium";
  return "Low";
}

// Increase priority by one level
function increasePriorityOneLevel(priority) {
  if (priority === "Low") return "Medium";
  if (priority === "Medium") return "High";
  return "High";
}

// Calculate priority based on category + duplicate complaints in last 24 hours
async function calculatePriority(category, hostelOrRoomNo) {
  let priority = basePriorityFromCategory(category);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const duplicates = await Complaint.countDocuments({
    category,
    hostelOrRoomNo,
    createdAt: { $gte: twentyFourHoursAgo },
  });

  // If there is already a complaint recently, increase priority
  if (duplicates >= 1) {
    priority = increasePriorityOneLevel(priority);
  }

  return priority;
}

// ==========================
// POST /
// CREATE NEW COMPLAINT
// ==========================
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    // Get and clean input values
    const studentName = normalizeText(req.body.studentName);
    const studentId = normalizeText(req.body.studentId);
    const category = normalizeText(req.body.category);
    const block = normalizeText(req.body.block);
    const roomNo = normalizeText(req.body.roomNo);
    const description = normalizeText(req.body.description);
    const hostelOrRoomNo = normalizeText(req.body.hostelOrRoomNo) || `${block} - Room ${roomNo}`;

    // Validate uploaded image
    const imageError = validateImage(req.file);
    if (imageError) return res.status(400).json({ message: imageError });

    // ==========================
    // VALIDATE STUDENT NAME
    // ==========================
    if (!studentName) return res.status(400).json({ message: "Student name is required." });
    if (studentName.length < 5 || studentName.length > 20) {
      return res.status(400).json({ message: "Student name must be between 5 and 20 characters." });
    }
    if (!ENGLISH_LETTERS_AND_SPACES_REGEX.test(studentName)) {
      return res.status(400).json({ message: "Student name must contain English letters and spaces only." });
    }

    // ==========================
    // VALIDATE STUDENT ID
    // ==========================
    if (!studentId) return res.status(400).json({ message: "Student ID is required." });
    if (studentId.length < 3 || studentId.length > 20) {
      return res.status(400).json({ message: "Student ID must be between 3 and 20 characters." });
    }
    if (!STUDENT_ID_REGEX.test(studentId)) {
      return res.status(400).json({ message: "Student ID must include both English letters and numbers." });
    }

    // ==========================
    // VALIDATE CATEGORY
    // ==========================
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Please select a valid complaint category." });
    }

    // ==========================
    // VALIDATE BLOCK
    // ==========================
    if (!block) return res.status(400).json({ message: "Block or hostel name is required." });
    if (block.length < 2 || block.length > 50) {
      return res.status(400).json({ message: "Block or hostel name must be between 2 and 50 characters." });
    }
    if (!ENGLISH_LETTERS_AND_SPACES_REGEX.test(block)) {
      return res.status(400).json({ message: "Block or hostel name must contain English letters and spaces only." });
    }

    // ==========================
    // VALIDATE ROOM NUMBER
    // ==========================
    if (!roomNo) return res.status(400).json({ message: "Room number is required." });
    if (roomNo.length < 1 || roomNo.length > 20) {
      return res.status(400).json({ message: "Room number must be between 1 and 20 digits." });
    }
    if (!ROOM_NUMBER_REGEX.test(roomNo)) {
      return res.status(400).json({ message: "Room number must contain numbers only." });
    }

    // ==========================
    // VALIDATE DESCRIPTION
    // ==========================
    if (!description) {
      return res.status(400).json({ message: "Please enter a complaint description." });
    }
    if (description.length < 15) {
      return res.status(400).json({ message: "Description must be at least 15 characters long." });
    }
    if (description.length > 500) {
      return res.status(400).json({ message: "Description must not exceed 500 characters." });
    }

    // ==========================
    // GENERATE UNIQUE COMPLAINT ID
    // ==========================
    let complaintId = generateComplaintId();
    while (await Complaint.exists({ complaintId })) {
      complaintId = generateComplaintId();
    }

    // Calculate priority
    const priority = await calculatePriority(category, hostelOrRoomNo);

    // Create complaint in database
    const complaint = await Complaint.create({
      complaintId,
      studentName,
      studentId,
      category,
      block,
      roomNo,
      description,
      hostelOrRoomNo,
      imageUrl: buildImageUrl(req),
      status: "Pending",
      priority,
      assignedTo: "",
      internalNotes: "",
      statusHistory: [{ status: "Pending", time: new Date() }],
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: `Complaint submitted successfully. Your complaint ID is ${complaint.complaintId}.`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================
// GET /mine
// GET ALL COMPLAINTS FOR STUDENT VIEW
// ==========================
router.get("/mine", async (req, res, next) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
});

// ==========================
// GET /
// GET ALL COMPLAINTS
// ==========================
router.get("/", async (req, res, next) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
});

// ==========================
// GET /:id
// GET SINGLE COMPLAINT BY ID
// ==========================
router.get("/:id", async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
});

// ==========================
// PUT /:id
// UPDATE COMPLAINT
// ==========================
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Validate new uploaded image if provided
    const imageError = validateImage(req.file);
    if (imageError) return res.status(400).json({ message: imageError });

    // Get new values or keep old values
    const nextStatus = req.body.status ? normalizeText(req.body.status) : complaint.status;
    const internalNotes = req.body.internalNotes !== undefined ? normalizeText(req.body.internalNotes) : complaint.internalNotes;
    const assignedTo = req.body.assignedTo !== undefined ? normalizeText(req.body.assignedTo) : complaint.assignedTo;

    // Validate status
    if (!VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ message: "Status must be Pending, In Progress or Resolved." });
    }

    // Validate internal notes length
    if (internalNotes && internalNotes.length > 1500) {
      return res.status(400).json({ message: "Internal notes cannot exceed 1500 characters." });
    }

    // Add status history only if status changed
    if (nextStatus !== complaint.status) {
      complaint.statusHistory.push({ status: nextStatus, time: new Date() });
    }

    // Update complaint fields
    complaint.status = nextStatus;
    complaint.internalNotes = internalNotes;
    complaint.assignedTo = assignedTo || "";
    complaint.resolvedAt = nextStatus === "Resolved" ? (complaint.resolvedAt || new Date()) : null;

    // Replace image if a new one is uploaded
    if (req.file) complaint.imageUrl = buildImageUrl(req);

    // Save changes
    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================
// DELETE /:id/cancel
// CANCEL ONLY PENDING COMPLAINT
// ==========================
router.delete("/:id/cancel", async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status !== "Pending") {
      return res.status(400).json({ message: "Only pending complaints can be cancelled." });
    }

    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint cancelled successfully" });
  } catch (error) {
    next(error);
  }
});

// ==========================
// DELETE /:id
// DELETE COMPLAINT BY ADMIN
// ==========================
router.delete("/:id", async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Export router
module.exports = router;