const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomChangeRequestSchema = new Schema({

    // Request ID (auto generated)
    requestId: {
        type: String,
        unique: true,
        required: false
    },

    // User Type
    userType: {
        type: String,
        required: false,
        enum: ['student-male', 'student-female', 'staff']
    },

    // Common Fields
    registrationNumber: { type: String, required: false, trim: true },
    fullName: { type: String, required: false, trim: true },
    nicIdNumber: { type: String, required: false, trim: true },
    contactNumber: { type: String, required: false, trim: true },
    emailAddress: { type: String, required: false, trim: true },

    // Gender
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female']
    },

    // Staff Fields
    staffId: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },

    // Current Room
    currentHostelName: { type: String, required: false, trim: true },
    currentRoomNumber: { type: String, required: false, trim: true },
    currentRoomType: {
        type: String,
        required: false,
        enum: ['Single', 'Shared', 'Dormitory', 'AC', 'Non-AC', 'Family']
    },

    // Preferred Room
    preferredHostel: { type: String, required: false, trim: true },
    preferredRoomNumber: { type: String, trim: true },
    preferredRoomType: {
        type: String,
        required: false,
        enum: ['Single', 'Shared', 'Dormitory', 'AC', 'Non-AC', 'Family']
    },

    // Reason
    reasonForRequest: {
        type: String,
        required: false,
        enum: [
            'Noise issues',
            'Health reasons',
            'Roommate issues',
            'Distance to classes',
            'Safety reasons',
            'Family accommodation',
            'Other'
        ]
    },
    otherReason: { type: String, trim: true },

    // Priority
    priorityLevel: {
        type: String,
        enum: ['Normal', 'Urgent'],
        default: 'Normal'
    },

    // Agreement
    studentAgreement: {
        type: Boolean,
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },

    // Admin Fields
    approvedBy: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    newRoomAllocated: { type: String, trim: true },

    adminComments: [
        {
            comment: String,
            commentedBy: String,
            commentedAt: { type: Date, default: Date.now }
        }
    ],

    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date }

}, { timestamps: true });


// =============================
// Generate Request ID
// =============================
function generateRequestId(userType, gender) {
    const prefix =
        userType === 'student-male' ? 'SMB' :
        userType === 'student-female' ? 'SFM' :
        'STF';

    const genderPrefix = gender === 'Male' ? 'M' : 'F';

    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100);

    return `${prefix}${genderPrefix}-${timestamp}${random}`;
}


// =============================
// PRE SAVE HOOK
// =============================
roomChangeRequestSchema.pre("save", function () {
    if (!this.requestId) {
        this.requestId = generateRequestId(this.userType, this.gender);
    }
});

module.exports = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);