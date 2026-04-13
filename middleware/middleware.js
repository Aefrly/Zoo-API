const jwt = require('jsonwebtoken');
const { db } = require('../database/setup');

// JWT Authentication Middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            error: 'Unauthorized',
            message: 'Access denied. No token provided.' 
        });
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: 'TokenExpired',
                message: 'Token expired. Please log in again.' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: 'InvalidToken',
                message: 'Invalid token. Please log in again.' 
            });
        } else {
            return res.status(401).json({ 
                success: false,
                error: 'TokenVerificationFailed',
                message: 'Token verification failed.' 
            });
        }
    }
}

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Logging middleware
const loggingMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        success: false,
        error: 'InternalServerError',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'NotFound',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
};

module.exports = {
    requireAuth,
    testConnection,
    loggingMiddleware,
    errorHandler,
    notFoundHandler
};