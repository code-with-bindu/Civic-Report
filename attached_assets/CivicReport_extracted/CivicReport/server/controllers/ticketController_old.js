const Ticket = require('../models/Ticket');

// ─── USER-FACING CONTROLLERS ───────────────────────────────────────────────────

/**
 * @desc    Create a new ticket (citizen reports an issue)
 * @route   POST /api/tickets
 * @access  Private (user)
 */
const createTicket = async (req, res, next) => {
    try {
        const { title, description, category, location } = req.body;

        // Build media array from uploaded files (Multer + Cloudinary)
        const media =
            req.files && req.files.length > 0
                ? req.files.map((file) => ({
                    url: file.path, // Cloudinary URL
                    resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
                }))
                : [];

        const ticket = await Ticket.create({
            title,
            description,
            category,
            location,
            media,
            createdBy: req.user._id,
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get tickets created by the logged-in user
 * @route   GET /api/tickets/my
 * @access  Private (user)
 */
const getMyTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single ticket by ID
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicketById = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('progressNotes.updatedBy', 'name');

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        // Users can only view their own tickets; admins can view any
        if (
            req.user.role !== 'admin' &&
            ticket.createdBy._id.toString() !== req.user._id.toString()
        ) {
            return res
                .status(403)
                .json({ success: false, message: 'Not authorized to view this ticket' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a ticket (user can edit title, description, category, location, media)
 * @route   PUT /api/tickets/:id
 * @access  Private (user — only if ticket is not Resolved)
 */
const updateTicket = async (req, res, next) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        // Only the creator can edit
        if (ticket.createdBy.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ success: false, message: 'Not authorized to edit this ticket' });
        }

        // Cannot edit resolved tickets
        if (ticket.status === 'Resolved') {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot edit a resolved ticket' });
        }

        const { title, description, category, location } = req.body;

        // Handle new file uploads (append to existing media)
        if (req.files && req.files.length > 0) {
            const newMedia = req.files.map((file) => ({
                url: file.path,
                resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
            }));
            ticket.media.push(...newMedia);
        }

        if (title) ticket.title = title;
        if (description) ticket.description = description;
        if (category) ticket.category = category;
        if (location) ticket.location = location;

        await ticket.save();

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a ticket (user can delete their own)
 * @route   DELETE /api/tickets/:id
 * @access  Private (user — own ticket only)
 */
const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this ticket',
            });
        }

        await ticket.deleteOne();
        res.status(200).json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
        next(error);
    }
};

// ─── ADMIN CONTROLLERS ─────────────────────────────────────────────────────────

/**
 * @desc    Get all tickets (with optional filters)
 * @route   GET /api/tickets/admin/all
 * @access  Private (admin)
 */
const getAllTickets = async (req, res, next) => {
    try {
        const { category, status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;

        const tickets = await Ticket.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email');

        const total = await Ticket.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: tickets.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: tickets,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update ticket status (admin only)
 * @route   PUT /api/tickets/admin/:id/status
 * @access  Private (admin)
 */
const updateTicketStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Submitted', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid status value' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a progress note to a ticket (admin only)
 * @route   POST /api/tickets/admin/:id/notes
 * @access  Private (admin)
 */
const addProgressNote = async (req, res, next) => {
    try {
        const { note } = req.body;

        if (!note) {
            return res
                .status(400)
                .json({ success: false, message: 'Note text is required' });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        ticket.progressNotes.push({
            note,
            updatedBy: req.user._id,
            date: Date.now(),
        });

        await ticket.save();

        // Re-populate for response
        await ticket.populate('progressNotes.updatedBy', 'name');

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Admin delete any ticket
 * @route   DELETE /api/tickets/admin/:id
 * @access  Private (admin)
 */
const adminDeleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res
                .status(404)
                .json({ success: false, message: 'Ticket not found' });
        }

        await ticket.deleteOne();
        res.status(200).json({ success: true, message: 'Ticket deleted by admin' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/tickets/admin/analytics
 * @access  Private (admin)
 */
const getAnalytics = async (req, res, next) => {
    try {
        const [statusStats, categoryStats, totalCount] = await Promise.all([
            // Count by status
            Ticket.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            // Count by category
            Ticket.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            // Total tickets
            Ticket.countDocuments(),
        ]);

        // Transform aggregation results into keyed objects
        const byStatus = {};
        statusStats.forEach((s) => (byStatus[s._id] = s.count));

        const byCategory = {};
        categoryStats.forEach((c) => (byCategory[c._id] = c.count));

        res.status(200).json({
            success: true,
            data: {
                total: totalCount,
                submitted: byStatus['Submitted'] || 0,
                inProgress: byStatus['In Progress'] || 0,
                resolved: byStatus['Resolved'] || 0,
                rejected: byStatus['Rejected'] || 0,
                byCategory,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getAllTickets,
    updateTicketStatus,
    addProgressNote,
    adminDeleteTicket,
    getAnalytics,
};
