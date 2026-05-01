const mongoose = require('mongoose');

/**
 * Notification Schema - tracks in-app notifications for users
 */
const notificationSchema = new mongoose.Schema(
    {
        // Recipient info
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        // Notification content
        type: {
            type: String,
            enum: [
                'issue_verified',
                'issue_confirmed',
                'issue_in_progress',
                'issue_resolved',
                'comment_added',
                'verification_threshold_reached',
            ],
            required: true,
        },
        
        title: {
            type: String,
            required: true,
        },
        
        message: {
            type: String,
            required: true,
        },
        
        // Reference to related issue
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
        },
        
        // Read status
        isRead: {
            type: Boolean,
            default: false,
        },
        
        readAt: Date,
    },
    { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
