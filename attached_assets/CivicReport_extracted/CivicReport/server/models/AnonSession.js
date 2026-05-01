const mongoose = require('mongoose');

/**
 * Anonymous Session Schema - tracks guest/anonymous users for voting and offline sync
 */
const anonSessionSchema = new mongoose.Schema(
    {
        // Unique identifier for this anonymous session
        sessionId: {
            type: String,
            unique: true,
            required: true,
        },
        
        // Anonymous identifier (stored client-side in localStorage)
        anonToken: {
            type: String,
            required: true,
        },
        
        // Device/browser info for proximity calculation
        ipAddress: String,
        userAgent: String,
        
        // Location info (from geolocation or IP)
        approximateLocation: {
            latitude: Number,
            longitude: Number,
        },
        
        // Track votes made by this session
        votedTickets: [
            {
                ticketId: mongoose.Schema.Types.ObjectId,
                votedAt: { type: Date, default: Date.now },
            },
        ],
        
        // Last activity
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Expire anonymous sessions after 30 days of inactivity
anonSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('AnonSession', anonSessionSchema);
