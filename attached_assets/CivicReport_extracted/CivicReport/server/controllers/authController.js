const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const AnonSession = require('../models/AnonSession');
const crypto = require('crypto');

/**
 * Generate a signed JWT for a given user ID.
 * Token expires in 30 days.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register a new user (citizen or government official)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { name, email, password, role, department } = req.body;

        // Validate role
        if (!['citizen', 'official'].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role. Must be "citizen" or "official"' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered. Please use a different email or try logging in.' 
            });
        }

        // Create user
        const user = await User.create({ 
            name: name.trim(), 
            email: email.toLowerCase().trim(), 
            password, 
            role: role || 'citizen',
            department: role === 'official' ? department : undefined,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        next(error);
    }
};

/**
 * @desc    Login user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Find user and explicitly include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

/**
 * @desc    Generate anonymous session token for guest submissions
 * @route   POST /api/auth/anonymous
 * @access  Public
 */
const generateAnonymousToken = async (req, res, next) => {
    try {
        const { latitude, longitude, userAgent } = req.body;
        
        // Generate unique session ID and token
        const sessionId = crypto.randomUUID();
        const anonToken = crypto.randomBytes(32).toString('hex');
        
        // Create or update anonymous session
        const anonSession = await AnonSession.create({
            sessionId,
            anonToken,
            userAgent: userAgent || req.get('user-agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            approximateLocation: latitude && longitude 
                ? { latitude, longitude }
                : undefined,
        });
        
        res.status(201).json({
            success: true,
            message: 'Anonymous session created',
            data: {
                sessionId: anonSession.sessionId,
                anonToken: anonSession.anonToken,
                expiresIn: '30 days',
            },
        });
    } catch (error) {
        console.error('Anonymous token error:', error);
        next(error);
    }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, generateAnonymousToken };
