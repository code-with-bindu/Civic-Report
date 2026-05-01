const Notification = require('../models/Notification');

/**
 * @desc    Get notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
    try {
        const { unreadOnly = false, page = 1, limit = 20 } = req.query;

        const filter = { userId: req.user._id };
        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('ticketId', 'title status');

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ 
            userId: req.user._id, 
            isRead: false 
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found' 
            });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this notification' 
            });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({ 
            success: true, 
            data: notification 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { 
                isRead: true, 
                readAt: new Date() 
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found' 
            });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this notification' 
            });
        }

        await notification.deleteOne();

        res.status(200).json({ 
            success: true, 
            message: 'Notification deleted' 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
