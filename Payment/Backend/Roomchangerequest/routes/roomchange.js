const express = require("express");
const router = express.Router();
const RoomChangeRequest = require("../models/roomchang");


// =============================
// Add Request
// =============================
router.post("/add", async (req, res) => {
    try {
        const newRequest = new RoomChangeRequest(req.body);
        await newRequest.save();

        res.status(201).json({
            message: "Room change request submitted successfully",
            requestId: newRequest.requestId
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// =============================
// Get All
// =============================
router.get("/display", async (req, res) => {
    try {
        const requests = await RoomChangeRequest.find()
            .sort({ createdAt: -1 });

        res.json(requests);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Get Single
// =============================
router.get("/view/:id", async (req, res) => {
    try {
        const request = await RoomChangeRequest.findById(req.params.id);

        if (!request)
            return res.status(404).json({ error: "Not found" });

        res.json(request);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Approve
// =============================
router.put("/approve/:id", async (req, res) => {
    const { approvedBy, newRoomAllocated } = req.body;

    try {
        const request = await RoomChangeRequest.findById(req.params.id);

        if (!request)
            return res.status(404).json({ error: "Not found" });

        request.status = "Approved";
        request.reviewedAt = new Date();
        request.approvedBy = approvedBy || "Admin";

        if (newRoomAllocated)
            request.newRoomAllocated = newRoomAllocated;

        await request.save();

        res.json({ message: "Approved successfully", request });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Reject
// =============================
router.put("/reject/:id", async (req, res) => {
    const { rejectionReason, rejectedBy } = req.body;

    if (!rejectionReason)
        return res.status(400).json({ error: "Rejection reason required" });

    try {
        const request = await RoomChangeRequest.findById(req.params.id);

        if (!request)
            return res.status(404).json({ error: "Not found" });

        request.status = "Rejected";
        request.reviewedAt = new Date();
        request.rejectionReason = rejectionReason;
        request.approvedBy = rejectedBy || "Admin";

        await request.save();

        res.json({ message: "Rejected successfully", request });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Add Comment
// =============================
router.post("/comment/:id", async (req, res) => {
    const { comment, commentedBy } = req.body;

    if (!comment || !commentedBy)
        return res.status(400).json({ error: "Comment & name required" });

    try {
        const request = await RoomChangeRequest.findById(req.params.id);

        if (!request)
            return res.status(404).json({ error: "Not found" });

        request.adminComments.push({ comment, commentedBy });

        await request.save();

        res.json({ message: "Comment added", comments: request.adminComments });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Delete
// =============================
router.delete("/delete/:id", async (req, res) => {
    try {
        const deleted = await RoomChangeRequest.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ error: "Not found" });

        res.json({ message: "Deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =============================
// Stats
// =============================
router.get("/stats", async (req, res) => {
    try {
        const total = await RoomChangeRequest.countDocuments();
        const pending = await RoomChangeRequest.countDocuments({ status: "Pending" });
        const approved = await RoomChangeRequest.countDocuments({ status: "Approved" });
        const rejected = await RoomChangeRequest.countDocuments({ status: "Rejected" });
        const completed = await RoomChangeRequest.countDocuments({ status: "Completed" });

        res.json({ total, pending, approved, rejected, completed });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;