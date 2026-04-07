const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require('path'); // Load environment variables

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Explicitly allow the frontend origin
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Add this for form data

// Environment variables
const PORT = process.env.PORT || 8070;
const MONGODB_URL = process.env.MONGODB_URL;

// MongoDB connection
mongoose.connect(MONGODB_URL)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.error("MongoDB Connection Failed:", err.message));

// Import routes
const roomdetailsRouter = require("./RoomDetailsForm/routes/roomdetails");
app.use("/roomdetails", roomdetailsRouter);

const roomchangeRouter = require("./Roomchangerequest/routes/roomchange");
app.use("/roomchange", roomchangeRouter);

// Add a test route to check if server is running
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    details: err.message 
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});