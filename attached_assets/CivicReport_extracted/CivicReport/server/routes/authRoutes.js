const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, generateAnonymousToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (citizen or government official)
 */
router.post(
    '/register',
    [
        body('name', 'Name is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        body('role', 'Role must be citizen or official').isIn(['citizen', 'official']),
    ],
    register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').notEmpty(),
    ],
    login
);

/**
 * @route   POST /api/auth/anonymous
 * @desc    Generate anonymous session token
 */
router.post('/anonymous', generateAnonymousToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user profile
 */
router.get('/me', protect, getMe);

module.exports = router;
