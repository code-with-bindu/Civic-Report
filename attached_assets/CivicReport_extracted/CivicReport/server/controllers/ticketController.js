const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const AnonSession = require('../models/AnonSession');
const User = require('../models/User');

// ─── CITIZEN CONTROLLERS ───────────────────────────────────────────────────────

/**
 * @desc    Create a new ticket (citizen/anonymous reports an issue)
 * @route   POST /api/tickets
 * @access  Public/Private
 */
const createTicket = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            location,
            latitude,
            longitude,
            isAnonymous,
            isUrgent,
            submitterName,
            submitterEmail,
            submitterPhone,
            anonToken,
        } = req.body;

        // Build media array from uploaded files (Multer + Cloudinary)
        const media =
            req.files && req.files.length > 0
                ? req.files.map((file) => ({
                    url: file.path, // Cloudinary URL
                    resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
                }))
                : [];

        // Determine submitter
        let createdBy = null;
        if (!isAnonymous && req.user) {
            createdBy = req.user._id;
            console.log(`📝 createTicket: Authenticated user ${req.user.name} creating ticket`);
        } else {
            console.log(`📝 createTicket: Anonymous submission (isAnonymous=${isAnonymous}, req.user=${!!req.user})`);
        }

        // Create ticket
        const ticket = await Ticket.create({
            title,
            description,
            category,
            location,
            gps: latitude && longitude ? { latitude, longitude } : undefined,
            media,
            isAnonymous,
            createdBy,
            submitterName: isAnonymous ? submitterName : undefined,
            submitterEmail: isAnonymous ? submitterEmail : undefined,
            submitterPhone: isAnonymous ? submitterPhone : undefined,
            isUrgent,
            status: 'Pending Verification',
            originalTimestamp: new Date(),
        });

        // If authenticated user, update their stats
        if (createdBy) {
            await User.findByIdAndUpdate(
                createdBy,
                { $inc: { issuesReported: 1 } }
            );

            // Create notification for the user
            await Notification.create({
                userId: createdBy,
                type: 'issue_verified',
                title: 'Issue Submitted',
                message: `Your issue "${title}" has been submitted and is awaiting community verification.`,
                ticketId: ticket._id,
            });
        }

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify/confirm an issue (upvote from citizen)
 * @route   POST /api/tickets/:id/verify
 * @access  Public/Private
 */
const verifyTicket = async (req, res, next) => {
    try {
        const { latitude, longitude, anonToken } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        // Prevent duplicate verification
        let hasVerified = false;
        if (req.user) {
            hasVerified = ticket.verifications.some(
                v => v.userId?.toString() === req.user._id.toString()
            );
        } else if (anonToken) {
            hasVerified = ticket.verifications.some(
                v => v.anonymousId === anonToken
            );
        }

        if (hasVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already verified this issue' 
            });
        }

        // Calculate proximity weight (simple distance-based)
        let proximityWeight = 1;
        if (latitude && longitude && ticket.gps?.latitude && ticket.gps?.longitude) {
            const distance = Math.sqrt(
                Math.pow(latitude - ticket.gps.latitude, 2) +
                Math.pow(longitude - ticket.gps.longitude, 2)
            );
            // Weight decreases with distance (within 5km radius)
            proximityWeight = Math.max(0.3, 1 - distance / 5);
        }

        // Add verification
        ticket.verifications.push({
            userId: req.user?._id,
            anonymousId: anonToken,
            proximityWeight,
        });

        // Update authenticity score (calculated via pre-save hook)
        // Check if score has reached threshold
        const newScore = ticket.verifications.length;
        if (newScore >= ticket.verificationThreshold && 
            ticket.status === 'Pending Verification') {
            ticket.status = 'Verified';

            // Notify original submitter
            if (ticket.createdBy) {
                await Notification.create({
                    userId: ticket.createdBy,
                    type: 'issue_verified',
                    title: 'Issue Verified!',
                    message: `Your issue "${ticket.title}" has been verified by the community and is now visible to government officials.`,
                    ticketId: ticket._id,
                });

                // Update user stats
                await User.findByIdAndUpdate(
                    ticket.createdBy,
                    { $inc: { issuesVerified: 1 } }
                );
            }
        }

        await ticket.save();

        res.status(200).json({ 
            success: true, 
            data: ticket,
            message: `Verification added. Score: ${newScore}/${ticket.verificationThreshold}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get tickets created by the logged-in user
 * @route   GET /api/tickets/citizen/my-issues
 * @access  Private
 */
const getMyTickets = async (req, res, next) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const filter = { createdBy: req.user._id };

        console.log(`🔍 getMyTickets: Looking for tickets with createdBy=${req.user._id} (user: ${req.user.name})`);

        if (status) filter.status = status;
        if (category) filter.category = category;

        const tickets = await Ticket.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email');

        const total = await Ticket.countDocuments(filter);

        console.log(`✅ getMyTickets: Found ${tickets.length} tickets out of ${total} total for user ${req.user.name}`);
        console.log(`📊 Sample ticket:`, tickets[0] ? { _id: tickets[0]._id, title: tickets[0].title, createdBy: tickets[0].createdBy } : 'No tickets');

        res.status(200).json({ 
            success: true, 
            count: tickets.length, 
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: tickets 
        });
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
            .populate('progressNotes.updatedBy', 'name')
            .populate('verifications.userId', 'name');

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a ticket (user can edit if still pending)
 * @route   PUT /api/tickets/:id
 * @access  Private
 */
const updateTicket = async (req, res, next) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        // Only the creator can edit
        if (ticket.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to edit this ticket' 
            });
        }

        // Cannot edit resolved tickets
        if (ticket.status === 'Resolved' || ticket.status === 'Rejected') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot edit a ${ticket.status.toLowerCase()} ticket` 
            });
        }

        const { title, description, category, location, isUrgent } = req.body;

        // Handle new file uploads
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
        if (isUrgent != null) ticket.isUrgent = isUrgent;

        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a ticket (user can delete their own)
 * @route   DELETE /api/tickets/:id
 * @access  Private
 */
const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        if (ticket.createdBy?.toString() !== req.user._id.toString()) {
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

// ─── GOVERNMENT OFFICIAL CONTROLLERS ───────────────────────────────────────────

/**
 * @desc    Get all verified tickets (government dashboard)
 * @route   GET /api/tickets/government/verified
 * @access  Private (official/admin)
 */
const getVerifiedTickets = async (req, res, next) => {
    try {
        const { category, status, sortBy = 'createdAt', department, page = 1, limit = 20 } = req.query;

        const filter = { status: { $in: ['Verified', 'In Progress', 'Resolved'] } };

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (department && req.user.role === 'official') {
            filter.assignedDepartment = department;
        }

        // Build sort object
        const sortObj = {};
        switch (sortBy) {
            case 'authenticity':
                sortObj.authenticityScore = -1;
                break;
            case 'urgency':
                sortObj.isUrgent = -1;
                sortObj.createdAt = -1;
                break;
            case 'deadline':
                sortObj.resolutionDeadline = 1;
                break;
            default:
                sortObj.createdAt = -1;
        }

        const tickets = await Ticket.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email')
            .populate('progressNotes.updatedBy', 'name');

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
 * @desc    Get ALL tickets (verified + unverified) for government dashboard
 * @route   GET /api/tickets/government/all-issues
 * @access  Private (official/admin)
 */
const getAllTicketsForGovernment = async (req, res, next) => {
    try {
        const { category, status, sortBy = 'createdAt', department, page = 1, limit = 20 } = req.query;

        // Show all statuses to government officials
        const filter = { status: { $in: ['Pending Verification', 'Verified', 'In Progress', 'Resolved', 'Rejected'] } };

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (department && req.user.role === 'official') {
            filter.assignedDepartment = department;
        }

        // Build sort object
        const sortObj = {};
        switch (sortBy) {
            case 'authenticity':
                sortObj.authenticityScore = -1;
                break;
            case 'urgency':
                sortObj.isUrgent = -1;
                sortObj.createdAt = -1;
                break;
            case 'deadline':
                sortObj.resolutionDeadline = 1;
                break;
            default:
                sortObj.createdAt = -1;
        }

        const tickets = await Ticket.find(filter)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('createdBy', 'name email')
            .populate('progressNotes.updatedBy', 'name');

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
 * @desc    Get ALL public tickets (verified + unverified + anonymous) for citizens to verify
 * @route   GET /api/tickets/public/all-issues
 * @access  Public/Private
 */
const getAllPublicTickets = async (req, res, next) => {
    try {
        const { category, status, sortBy = 'createdAt', page = 1, limit = 20 } = req.query;

        // Show all non-rejected tickets to public
        const filter = { status: { $in: ['Pending Verification', 'Verified', 'In Progress', 'Resolved'] } };

        if (category) filter.category = category;
        if (status) filter.status = status;

        // Build sort object
        const sortObj = {};
        switch (sortBy) {
            case 'authenticity':
                sortObj.authenticityScore = -1;
                break;
            case 'urgency':
                sortObj.isUrgent = -1;
                sortObj.createdAt = -1;
                break;
            case 'recent':
            default:
                sortObj.createdAt = -1;
        }

        const tickets = await Ticket.find(filter)
            .sort(sortObj)
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
 * @desc    Update ticket status (government official)
 * @route   PUT /api/tickets/:id/status
 * @access  Private (official/admin)
 */
const updateTicketStatus = async (req, res, next) => {
    try {
        const { status, resolutionDetails } = req.body;

        const validStatuses = ['Pending Verification', 'Verified', 'In Progress', 'Resolved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status value' 
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        const oldStatus = ticket.status;
        ticket.status = status;

        if (status === 'Resolved') {
            ticket.resolvedDate = new Date();
            if (resolutionDetails) {
                ticket.resolutionDetails = resolutionDetails;
            }

            // Update user stats
            if (ticket.createdBy) {
                await User.findByIdAndUpdate(
                    ticket.createdBy,
                    { $inc: { issuesResolved: 1 } }
                );

                // Notify submitter
                await Notification.create({
                    userId: ticket.createdBy,
                    type: 'issue_resolved',
                    title: 'Your Issue Has Been Resolved!',
                    message: `${ticket.title} - ${resolutionDetails || 'No details provided'}`,
                    ticketId: ticket._id,
                });
            }
        }

        if (status === 'In Progress') {
            // Notify submitter that work has started
            if (ticket.createdBy) {
                await Notification.create({
                    userId: ticket.createdBy,
                    type: 'issue_in_progress',
                    title: 'Your Issue Is Being Addressed',
                    message: `Work has started on your issue: ${ticket.title}`,
                    ticketId: ticket._id,
                });
            }
        }

        await ticket.save();

        res.status(200).json({ 
            success: true, 
            data: ticket,
            message: `Status updated from ${oldStatus} to ${status}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Assign ticket to department (government official)
 * @route   PUT /api/tickets/:id/assign
 * @access  Private (official/admin)
 */
const assignTicket = async (req, res, next) => {
    try {
        const { department, deadline } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        ticket.assignedDepartment = department;
        if (deadline) {
            ticket.resolutionDeadline = new Date(deadline);
        }

        await ticket.save();

        res.status(200).json({ 
            success: true, 
            data: ticket,
            message: `Assigned to ${department}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a progress note to a ticket (government official)
 * @route   POST /api/tickets/:id/notes
 * @access  Private (official/admin)
 */
const addProgressNote = async (req, res, next) => {
    try {
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({ 
                success: false, 
                message: 'Note text is required' 
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        ticket.progressNotes.push({
            note,
            updatedBy: req.user._id,
            date: Date.now(),
        });

        await ticket.save();
        await ticket.populate('progressNotes.updatedBy', 'name');

        // Notify submitter of update
        if (ticket.createdBy) {
            await Notification.create({
                userId: ticket.createdBy,
                type: 'comment_added',
                title: 'Update on Your Issue',
                message: `A progress update has been added to "${ticket.title}"`,
                ticketId: ticket._id,
            });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/tickets/analytics/dashboard
 * @access  Private (official/admin)
 */
const getAnalytics = async (req, res, next) => {
    try {
        const [statusStats, categoryStats, totalCount, urgentCount, recentTickets] = await Promise.all([
            // Count by status
            Ticket.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            // Count by category
            Ticket.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            // Total tickets
            Ticket.countDocuments({ status: { $in: ['Verified', 'In Progress', 'Resolved'] } }),
            // Urgent count
            Ticket.countDocuments({ isUrgent: true, status: { $in: ['Verified', 'In Progress'] } }),
            // Recent updates
            Ticket.find({ status: { $in: ['Verified', 'In Progress', 'Resolved'] } })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('title status assignedDepartment updatedAt'),
        ]);

        const byStatus = {};
        statusStats.forEach((s) => (byStatus[s._id] = s.count));

        const byCategory = {};
        categoryStats.forEach((c) => (byCategory[c._id] = c.count));

        res.status(200).json({
            success: true,
            data: {
                totalIssues: totalCount,
                pendingVerification: byStatus['Pending Verification'] || 0,
                verified: byStatus['Verified'] || 0,
                inProgress: byStatus['In Progress'] || 0,
                resolved: byStatus['Resolved'] || 0,
                rejected: byStatus['Rejected'] || 0,
                urgentCount,
                byCategory,
                recentUpdates: recentTickets,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all tickets near a location  (for community map)
 * @route   GET /api/tickets/location/nearby
 * @access  Public
 */
const getNearbyTickets = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                message: 'Latitude and longitude are required' 
            });
        }

        const tickets = await Ticket.find({
            gps: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
                },
            },
            status: { $in: ['Verified', 'In Progress'] }, // Only show verified issues
        })
            .limit(50)
            .select('title category gps status authenticityScore isUrgent');

        res.status(200).json({ 
            success: true, 
            count: tickets.length,
            data: tickets 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Admin delete any ticket
 * @route   DELETE /api/tickets/:id/admin
 * @access  Private (admin)
 */
const adminDeleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        await ticket.deleteOne();
        res.status(200).json({ success: true, message: 'Ticket deleted by admin' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Citizen
    createTicket,
    verifyTicket,
    getMyTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getNearbyTickets,
    
    // Government Official
    getVerifiedTickets,
    getAllTicketsForGovernment,
    updateTicketStatus,
    assignTicket,
    addProgressNote,
    getAnalytics,
    
    // Public
    getAllPublicTickets,
    
    // Admin
    adminDeleteTicket,
};
