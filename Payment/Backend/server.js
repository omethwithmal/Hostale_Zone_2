require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser'); // Add this

const app = express();

// =========================
// CONFIG
// =========================
const PORT = 5000;

// MongoDB Atlas Connection
const FALLBACK_MONGO_URI =
  "mongodb+srv://admin:r6xGO5FZH24eeqMr@cluster0.6uccgcl.mongodb.net/hostel_management";

const mongoCandidates = [
  process.env.MONGO_URI,
  process.env.MONGO_URL,
  FALLBACK_MONGO_URI,
].filter(Boolean);

// =========================
// CORS
// =========================
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-User-Id",
    "X-User-Email",
    "X-User-It-Number",
    "X-User-Type",
    "X-User-Name",
  ],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// =========================
// MIDDLEWARE
// =========================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// CHANGED: uploads path kept as "Uploads" to match your folder name in Backend
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// =========================
// MONGODB CONNECTION
// =========================
async function connectMongo() {
  let lastError = null;

  for (const uri of mongoCandidates) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ MongoDB Atlas Connected Successfully!");
      return;
    } catch (error) {
      lastError = error;
      console.warn("⚠️ MongoDB connection attempt failed. Trying next URI...");
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }

  throw lastError || new Error("No valid MongoDB connection URI found.");
}

// =========================
// ROUTES
// =========================
const roomdetailsRouter = require("./RoomDetailsForm/routes/roomdetails");
app.use("/roomdetails", roomdetailsRouter);

const roomchangeRouter = require("./Roomchangerequest/routes/roomchange");
app.use("/roomchange", roomchangeRouter);

// CHANGED: added complaint router import + route
const complaintRouter = require("./ComplaintManagement/routes/complaint");
app.use("/api/complaints", complaintRouter);
const leaverequestRouter = require("./LeaveRequest/routes/leaverequests");
app.use("/leaverequests", leaverequestRouter);

const loginSignRoutes = require("../Backend/LoginSignup/router");
app.use("/api/auth", loginSignRoutes); // Changed path to avoid conflicts

const paymentRouter = require("./Payment/routes/payment");
app.use("/api/payments", paymentRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// =========================
// ERROR HANDLING
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// =========================
// START SERVER
// =========================
async function startServer() {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);

      // CHANGED: uploads log path updated to "Uploads"
      console.log(`📁 Uploads directory: ${path.join(__dirname, "Uploads")}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

startServer();

//abc
