const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./auth');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}

function authorizeRole(roles) {
    return (req, res, next) => {
        if (typeof roles === 'string') {
            roles = [roles];
        }

        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`⛔ Access Denied: User role '${req.user?.role}' not in [${roles.join(', ')}]`);
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    }
}

module.exports = { authenticateToken, authorizeRole };
