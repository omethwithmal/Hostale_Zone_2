const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegisterSchema = new Schema({
    itNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Other'],
        default: 'Computer Science'
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    profilePhoto: {
        type: String,
        default: '' // Store base64 string or URL path
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    userType: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    roomNumber: {
        type: String,
        default: ''
    },
    block: {
        type: String,
        default: '',
        trim: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Register', RegisterSchema);
