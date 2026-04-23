const express = require("express");
const router = express.Router();
const RoomDetails = require("../models/roomdetail");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =============================
// Multer Configuration for Image Upload
// =============================

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/rooms';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'room-' + uniqueSuffix + ext);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// =============================
// Add New Room with Images
// =============================
router.post("/add", upload.array('images', 10), async (req, res) => {
    try {
        // Parse amenities if it's sent as JSON string
        let roomData = { ...req.body };
        
        if (req.body.amenities && typeof req.body.amenities === 'string') {
            try {
                roomData.amenities = JSON.parse(req.body.amenities);
            } catch (e) {
                roomData.amenities = {};
            }
        }

        // Add image paths if files are uploaded
        if (req.files && req.files.length > 0) {
            roomData.images = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        const newRoom = new RoomDetails(roomData);
        await newRoom.save();

        res.json({
            message: "Room added successfully",
            roomId: newRoom.roomId,
            images: newRoom.images
        });
    } catch (err) {
        // Delete uploaded files if error occurs
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            });
        }
        
        res.status(500).json({
            error: "Failed to add room",
            details: err.message
        });
    }
});

// =============================
// Get All Rooms (with image URLs)
// =============================
router.get("/display", async (req, res) => {
    try {
        const rooms = await RoomDetails.find().sort({ createdAt: -1 });
        
        // Add full URLs for images
        const roomsWithImageUrls = rooms.map(room => {
            const roomObj = room.toObject();
            if (roomObj.images && roomObj.images.length > 0) {
                roomObj.imageUrls = roomObj.images.map(img => 
                    `${req.protocol}://${req.get('host')}/${img}`
                );
            }
            return roomObj;
        });
        
        res.json(roomsWithImageUrls);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch rooms",
            details: err.message
        });
    }
});

// =============================
// Get Single Room by Mongo ID (with image URLs)
// =============================
router.get("/view/:id", async (req, res) => {
    try {
        const room = await RoomDetails.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Add full URLs for images
        const roomObj = room.toObject();
        if (roomObj.images && roomObj.images.length > 0) {
            roomObj.imageUrls = roomObj.images.map(img => 
                `${req.protocol}://${req.get('host')}/${img}`
            );
        }

        res.json(roomObj);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch room",
            details: err.message
        });
    }
});

// =============================
// Get Room by roomId (RM-XXXXXX) (with image URLs)
// =============================
router.get("/view/room/:roomId", async (req, res) => {
    try {
        const room = await RoomDetails.findOne({
            roomId: req.params.roomId
        });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Add full URLs for images
        const roomObj = room.toObject();
        if (roomObj.images && roomObj.images.length > 0) {
            roomObj.imageUrls = roomObj.images.map(img => 
                `${req.protocol}://${req.get('host')}/${img}`
            );
        }

        res.json(roomObj);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch room",
            details: err.message
        });
    }
});

// =============================
// Add Images to Existing Room
// =============================
router.post("/add-images/:id", upload.array('images', 10), async (req, res) => {
    try {
        const room = await RoomDetails.findById(req.params.id);
        if (!room) {
            // Delete uploaded files if room not found
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.status(404).json({ error: "Room not found" });
        }

        // Add new images to existing images array
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path.replace(/\\/g, '/'));
            room.images = [...room.images, ...newImages];
            await room.save();
        }

        res.json({
            message: "Images added successfully",
            images: room.images
        });
    } catch (err) {
        // Delete uploaded files if error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            });
        }
        
        res.status(500).json({
            error: "Failed to add images",
            details: err.message
        });
    }
});

// =============================
// Delete Specific Image from Room
// =============================
router.delete("/delete-image/:roomId/:imageIndex", async (req, res) => {
    try {
        const room = await RoomDetails.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        const imageIndex = parseInt(req.params.imageIndex);
        if (imageIndex < 0 || imageIndex >= room.images.length) {
            return res.status(400).json({ error: "Invalid image index" });
        }

        // Get image path and delete file from filesystem
        const imagePath = room.images[imageIndex];
        const fullPath = path.join(__dirname, '..', imagePath);
        
        fs.unlink(fullPath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        // Remove image from array
        room.images.splice(imageIndex, 1);
        await room.save();

        res.json({
            message: "Image deleted successfully",
            images: room.images
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to delete image",
            details: err.message
        });
    }
});

// =============================
// Update Room (Full Update) with Images
// =============================
router.put("/update/:id", upload.array('images', 10), async (req, res) => {
    try {
        const room = await RoomDetails.findById(req.params.id);
        if (!room) {
            // Delete uploaded files if room not found
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.status(404).json({ error: "Room not found" });
        }

        // Parse amenities if it's sent as string
        let updateData = { ...req.body };
        
        if (req.body.amenities && typeof req.body.amenities === 'string') {
            try {
                updateData.amenities = JSON.parse(req.body.amenities);
            } catch (e) {
                updateData.amenities = {};
            }
        }

        // Handle images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path.replace(/\\/g, '/'));
            
            // If replaceImages flag is true, delete old images
            if (req.body.replaceImages === 'true') {
                // Delete old images from filesystem
                room.images.forEach(imagePath => {
                    const fullPath = path.join(__dirname, '..', imagePath);
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error("Error deleting old image:", err);
                    });
                });
                updateData.images = newImages;
            } else {
                // Append new images to existing ones
                updateData.images = [...room.images, ...newImages];
            }
        }

        const updatedRoom = await RoomDetails.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            message: "Room updated successfully",
            room: updatedRoom
        });
    } catch (err) {
        // Delete uploaded files if error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            });
        }
        
        res.status(500).json({
            error: "Failed to update room",
            details: err.message
        });
    }
});

// =============================
// Update Room Status Only
// =============================
router.put("/update/status/:id", async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'maintenance', 'unavailable'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }
    
    try {
        const room = await RoomDetails.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        room.status = status;
        await room.save();
        
        res.json({
            message: "Room status updated successfully",
            room
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to update status",
            details: err.message
        });
    }
});

// =============================
// Delete Room (with images)
// =============================
router.delete("/delete/:id", async (req, res) => {
    try {
        const room = await RoomDetails.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Delete all associated images from filesystem
        if (room.images && room.images.length > 0) {
            room.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) console.error("Error deleting image:", err);
                });
            });
        }

        await RoomDetails.findByIdAndDelete(req.params.id);
        
        res.json({ 
            message: "Room and associated images deleted successfully",
            deletedImages: room.images.length 
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to delete room",
            details: err.message
        });
    }
});

// =============================
// Get Room Statistics
// =============================
router.get("/stats", async (req, res) => {
    try {
        const total = await RoomDetails.countDocuments();
        const available = await RoomDetails.countDocuments({ status: 'available' });
        const occupied = await RoomDetails.countDocuments({ status: 'occupied' });
        const maintenance = await RoomDetails.countDocuments({ status: 'maintenance' });
        const unavailable = await RoomDetails.countDocuments({ status: 'unavailable' });
        
        res.json({
            total,
            available,
            occupied,
            maintenance,
            unavailable
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch statistics",
            details: err.message
        });
    }
});

// =============================
// Search Rooms (with image URLs)
// =============================
router.get("/search", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }
    
    try {
        const rooms = await RoomDetails.find({
            $or: [
                { roomNumber: { $regex: query, $options: 'i' } },
                { roomType: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        // Add full URLs for images
        const roomsWithImageUrls = rooms.map(room => {
            const roomObj = room.toObject();
            if (roomObj.images && roomObj.images.length > 0) {
                roomObj.imageUrls = roomObj.images.map(img => 
                    `${req.protocol}://${req.get('host')}/${img}`
                );
            }
            return roomObj;
        });
        
        res.json(roomsWithImageUrls);
    } catch (err) {
        res.status(500).json({
            error: "Failed to search rooms",
            details: err.message
        });
    }
});

module.exports = router;