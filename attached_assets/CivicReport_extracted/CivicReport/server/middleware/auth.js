const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Verify the JWT token from the Authorization header.
 * Attaches the decoded user object to req.user.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from "Bearer <token>" header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Not authorized — no token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (exclude password)
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: 'Not authorized — user not found' });
        }

        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: 'Not authorized — token invalid' });
    }
};

/**
 * optionalAuth — Try to verify JWT token if present, but don't fail if missing.
 * Allows both authenticated and anonymous requests.
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Extract token from "Bearer <token>" header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (exclude password)
            req.user = await User.findById(decoded.id);
            console.log('✅ optionalAuth: Token verified, user attached:', req.user?.name);
        } else {
            console.log('⚠️ optionalAuth: No token provided - anonymous request');
        }

        // Continue regardless of whether token was found or valid
        next();
    } catch (error) {
        // Silently fail — user will just be undefined
        console.log('❌ optionalAuth: Token verification failed:', error.message);
        next();
    }
};

/**
 * authorize — Restrict access to specified roles.
 * Must be used AFTER protect middleware.
 * @param  {...string} roles  Allowed roles, e.g. 'admin', 'user'
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize, optionalAuth };
