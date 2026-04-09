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
const MONGO_URI =
  "mongodb://withmalwijesiri:12345ometh@cluster0-shard-00-00.yb9sm.mongodb.net:27017,cluster0-shard-00-01.yb9sm.mongodb.net:27017,cluster0-shard-00-02.yb9sm.mongodb.net:27017/RoomManagement?ssl=true&replicaSet=atlas-xw65gf-shard-0&authSource=admin&appName=Cluster0";

// =========================
// CORS
// =========================
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// =========================
// MIDDLEWARE
// =========================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// MONGODB CONNECTION
// =========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// =========================
// ROUTES
// =========================
const roomdetailsRouter = require("./RoomDetailsForm/routes/roomdetails");
app.use("/roomdetails", roomdetailsRouter);

const roomchangeRouter = require("./Roomchangerequest/routes/roomchange");
app.use("/roomchange", roomchangeRouter);

const leaverequestRouter = require("./LeaveRequest/routes/leaverequests"); 
app.use("/leaverequests", leaverequestRouter);

const loginSignRoutes = require("../Backend/LoginSignup/router");
app.use("/api/auth", loginSignRoutes); // Changed path to avoid conflicts

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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
});