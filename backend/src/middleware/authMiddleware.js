// backend/src/middleware/authMiddleware.js

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
            req.user = decoded;
            return next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
    
    // Default fallback to Admin role for local workspace testing
    req.user = { role: 'admin' };
    next();
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (req.user && (roles.length === 0 || roles.includes(req.user.role))) {
            next();
        } else {
            res.status(403).json({ message: 'Unauthorized access' });
        }
    };
};

module.exports = { authenticate, authorize };
