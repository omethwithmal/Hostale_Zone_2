const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomDetailsSchema = new Schema(
  {
    // Room ID (Auto Generated)
    roomId: {
      type: String,
      unique: true,
      default: function () {
        // Generate RM-XXXXXX automatically
        return 'RM-' + Date.now().toString().slice(-6);
      }
    },
    // Basic Information
    roomNumber: {
      type: String,
      trim: true
    },
    monthlyPrice: {
      type: Number
    },
    roomType: {
      type: String,
      enum: ['single', 'shared']
    },
    maxOccupancy: {
      type: Number
    },
    floorNumber: {
      type: Number
    },
    size: {
      type: Number // sq.ft
    },
    description: {
      type: String,
      trim: true
    },
    // Availability
    availableFrom: {
      type: Date
    },
    availableTo: {
      type: Date
    },
    // Room Status
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'unavailable'],
      default: 'available'
    },
    // Amenities
    amenities: {
      privateBathroom: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      highSpeedWifi: { type: Boolean, default: false },
      studyDesks: { type: Number, default: 0 },
      storageLockers: { type: Boolean, default: false },
      miniFridge: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      microwave: { type: Boolean, default: false },
      washingMachine: { type: Boolean, default: false },
      waterHeater: { type: Boolean, default: false },
      parking: { type: Boolean, default: false }
    },
    // Images (store image URLs or file paths)
    images: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create Model
const RoomDetails = mongoose.model('RoomDetails', roomDetailsSchema);

module.exports = RoomDetails;