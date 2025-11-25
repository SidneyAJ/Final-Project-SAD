const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /notifications - Get user's notifications
router.get('/', authenticateToken, (req, res) => {
    const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
    `;

    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// POST /notifications/mark-read - Mark all as read
router.post('/mark-read', authenticateToken, (req, res) => {
    const query = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
    db.run(query, [req.user.id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Marked as read' });
    });
});

// Helper function to create notification (internal use)
// This should be exported or used via a shared utility, but for now we'll assume direct DB inserts from other modules
// or we can expose an endpoint if we want microservice style (not recommended for monolith).
// Ideally, we create a utility function `createNotification` in `utils/notificationService.js`

module.exports = router;
