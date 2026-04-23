const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveRequestSchema = new Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    studentItNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    block: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D'],
        uppercase: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    approvedBy: {
        type: String,
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    leaveRequestId: {
        type: String,
        unique: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);