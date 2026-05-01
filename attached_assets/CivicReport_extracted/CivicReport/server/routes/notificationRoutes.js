const express = require('express');
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

// Protect all notification routes
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for logged-in user
 */
router.get('/', getNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 */
router.put('/:id/read', markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 */
router.put('/mark-all-read', markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 */
router.delete('/:id', deleteNotification);

module.exports = router;
