const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check admin role
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
}

// GET /payments - Get all payments (Filtered by Role)
router.get('/', authenticateToken, (req, res) => {
    let query = `
        SELECT p.*, pt.full_name as patient_name
        FROM payments p
        LEFT JOIN patients pt ON p.patient_id = pt.id
    `;

    const params = [];

    // Data Isolation: Patients can only see their own payments
    if (req.user.role === 'patient') {
        query += ` WHERE pt.user_id = ?`;
        params.push(req.user.id);
    }

    query += ` ORDER BY p.created_at DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching payments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// POST /payments - Create new payment (Bill)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    const { patient_id, amount, description } = req.body;

    if (!patient_id || !amount) {
        return res.status(400).json({ error: 'Patient ID and Amount are required' });
    }

    const query = "INSERT INTO payments (patient_id, amount, description, status) VALUES (?, ?, ?, 'pending')";
    db.run(query, [patient_id, amount, description], function (err) {
        if (err) {
            console.error('Error creating payment:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Payment created successfully', id: this.lastID });
    });
});

// PUT /payments/:id/pay - Process payment
router.put('/:id/pay', authenticateToken, requireAdmin, (req, res) => {
    const { payment_method } = req.body;
    const paymentId = req.params.id;

    if (!payment_method) {
        return res.status(400).json({ error: 'Payment method is required' });
    }

    const query = "UPDATE payments SET status = 'paid', payment_method = ? WHERE id = ?";
    db.run(query, [payment_method, paymentId], function (err) {
        if (err) {
            console.error('Error processing payment:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ message: 'Payment processed successfully' });
    });
});

module.exports = router;
