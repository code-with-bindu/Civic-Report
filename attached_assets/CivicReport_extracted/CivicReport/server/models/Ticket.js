const mongoose = require('mongoose');

/**
 * Progress Note sub-schema — each note records a status update or comment
 * added by a government official, along with a timestamp.
 */
const progressNoteSchema = new mongoose.Schema(
    {
        note: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

/**
 * Verification sub-schema — tracks who verified/confirmed the issue
 */
const verificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        anonymousId: String, // For anonymous users
        proximityWeight: {
            type: Number,
            default: 1,
            min: 0,
            max: 1,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

/**
 * Ticket Schema - Comprehensive civic issue model
 */
const ticketSchema = new mongoose.Schema(
    {
        // Basic Info
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Pothole', 'Water Logging', 'Streetlight', 'Graffiti', 'Garbage', 'Safety', 'Other'],
        },

        // Location info
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        gps: {
            latitude: Number,
            longitude: Number,
        },

        // Media
        media: [
            {
                url: { type: String, required: true },
                resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
            },
        ],

        // Submission info
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        submitterName: String, // For anonymous submissions
        submitterEmail: String, // For anonymous submissions
        submitterPhone: String, // For follow-up on anonymous issues

        // Urgency
        isUrgent: {
            type: Boolean,
            default: false,
        },

        // Status and Verification
        status: {
            type: String,
            enum: ['Pending Verification', 'Verified', 'In Progress', 'Resolved', 'Rejected'],
            default: 'Pending Verification',
        },
        verifications: [verificationSchema],
        authenticityScore: {
            type: Number,
            default: 0,
            min: 0,
        },
        verificationThreshold: {
            type: Number,
            default: 5,
        },

        // Government side
        assignedDepartment: String,
        resolutionDeadline: Date,
        resolvedDate: Date,
        resolutionDetails: String,

        // Progress tracking
        progressNotes: [progressNoteSchema],

        // Offline sync support
        offlineSyncId: String, // Unique ID for offline-submitted issues
        originalTimestamp: Date, // Preserve original submission time for offline issues

        // Auto-rejection for unverified issues
        rejectionReason: String,
    },
    { timestamps: true }
);

// Index for geospatial queries
ticketSchema.index({ 'gps.latitude': 1, 'gps.longitude': 1 });

// Index for faster dashboard queries
ticketSchema.index({ status: 1, category: 1, updatedAt: -1 });

// Calculate authenticity score before saving
ticketSchema.pre('save', function (next) {
    this.authenticityScore = this.verifications.length;
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
