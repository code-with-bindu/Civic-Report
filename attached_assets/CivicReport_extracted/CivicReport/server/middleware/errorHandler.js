/**
 * Global error-handling middleware.
 * Catches errors thrown or passed via next(err) and returns a
 * consistent JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource ID',
        });
    }

    // Mongoose duplicate key (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return res.status(400).json({
            success: false,
            message: `The ${field} "${value}" is already registered. Please use a different ${field}.`,
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join('; '),
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Your session has expired. Please log in again.',
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = 
        statusCode === 500 
            ? 'Internal Server Error. Please try again later.'
            : err.message || 'An error occurred';

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;
