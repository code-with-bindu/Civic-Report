const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    createTicket,
    verifyTicket,
    getMyTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getNearbyTickets,
    getVerifiedTickets,
    getAllTicketsForGovernment,
    getAllPublicTickets,
    updateTicketStatus,
    assignTicket,
    addProgressNote,
    getAnalytics,
    adminDeleteTicket,
} = require('../controllers/ticketController');

const router = express.Router();

// ─── PUBLIC ROUTES (No authentication required) ──────────────────────────────

/** Create a new ticket (citizen or anonymous) — optional auth for logged-in users */
router.post('/', optionalAuth, upload.array('media', 5), createTicket);

/** Get nearby tickets (for community map) */
router.get('/location/nearby', getNearbyTickets);

/** Get ALL public tickets (verified + unverified + anonymous) for citizens to verify */
router.get('/public/all-issues', getAllPublicTickets);

// ─── PROTECTED ROUTES (Authentication required) ──────────────────────────────

router.use(protect);

// ─── CITIZEN ROUTES (MUST come before generic :id route) ─────────────────────

/** Verify/confirm a ticket (upvote) */
router.post('/:id/verify', verifyTicket);

/** Get tickets created by the logged-in citizen */
router.get('/citizen/my-issues', getMyTickets);
router.get('/my', getMyTickets); // Alias for convenience

/** Get a single ticket by ID (GENERIC route — must come LAST) */
router.get('/:id', getTicketById);

/** Update own ticket */
router.put('/:id', upload.array('media', 5), updateTicket);

/** Delete own ticket */
router.delete('/:id', deleteTicket);

// ─── GOVERNMENT OFFICIAL ROUTES ─────────────────────────────────────────────

/** Get all verified tickets (government dashboard) */
router.get('/government/verified', authorize('official', 'admin'), getVerifiedTickets);

/** Get ALL tickets including unverified (government dashboard) */
router.get('/government/all-issues', authorize('official', 'admin'), getAllTicketsForGovernment);

/** Update ticket status (mark as In Progress, Resolved, etc.) */
router.put('/:id/status', authorize('official', 'admin'), updateTicketStatus);

/** Assign ticket to department and set deadline */
router.put('/:id/assign', authorize('official', 'admin'), assignTicket);

/** Add progress notes */
router.post('/:id/notes', authorize('official', 'admin'), addProgressNote);

// ─── ANALYTICS ROUTES ────────────────────────────────────────────────────────

/** Get dashboard analytics (government official) */
router.get('/analytics/dashboard', authorize('official', 'admin'), getAnalytics);

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

/** Admin delete any ticket */
router.delete('/:id/admin', authorize('admin'), adminDeleteTicket);

module.exports = router;
