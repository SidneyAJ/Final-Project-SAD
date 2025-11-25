const db = require('../database');

console.log('AuditLogger module loaded');
function logAudit(req, action, details) {
    console.log('logAudit called with req:', req);
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || (req.connection && req.connection.remoteAddress) || '0.0.0.0';

    db.run(
        "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
        [userId, action, JSON.stringify(details), ipAddress],
        (err) => {
            if (err) {
                console.error('Error logging audit:', err.message);
            }
        }
    );
}

module.exports = logAudit;
