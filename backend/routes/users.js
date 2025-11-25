const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const logAudit = require('../utils/auditLogger');

const router = express.Router();

// Middleware: Ensure user is admin
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
}

router.use(authenticateToken);
router.use(isAdmin);

// Get All Users
router.get('/', (req, res) => {
    db.all("SELECT id, email, role, name, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Single User
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    db.get("SELECT id, email, role, name, created_at FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    });
});

// Create User (Admin)
router.post('/', async (req, res) => {
    const { email, password, role, name, ...details } = req.body;

    if (!email || !password || !role || !name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run("INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
            [email, hashedPassword, role, name],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const userId = this.lastID;

                // Handle role-specific data
                if (role === 'patient') {
                    const { date_of_birth, gender, phone, address, blood_type } = details;
                    db.run(
                        "INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone, address, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [userId, name, date_of_birth, gender, phone, address, blood_type]
                    );
                } else if (role === 'doctor') {
                    const { specialization, sip_number, phone, available_days, available_hours } = details;
                    db.run(
                        "INSERT INTO doctors (user_id, full_name, specialization, sip_number, phone, available_days, available_hours) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [userId, name, specialization, sip_number, phone, JSON.stringify(available_days), JSON.stringify(available_hours)]
                    );
                }

                // Audit Log
                logAudit(req, 'CREATE_USER', { target_user_id: userId, role, email });

                res.status(201).json({ message: 'User created successfully', id: userId });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { email, role, name, password } = req.body;

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run("UPDATE users SET email = ?, role = ?, name = ?, password_hash = ? WHERE id = ?",
                [email, role, name, hashedPassword, userId],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    logAudit(req, 'UPDATE_USER', { target_user_id: userId, changes: req.body });
                    res.json({ message: 'User updated successfully' });
                }
            );
        } else {
            db.run("UPDATE users SET email = ?, role = ?, name = ? WHERE id = ?",
                [email, role, name, userId],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    logAudit(req, 'UPDATE_USER', { target_user_id: userId, changes: req.body });
                    res.json({ message: 'User updated successfully' });
                }
            );
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete User
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

        logAudit(req, 'DELETE_USER', { target_user_id: userId });
        res.json({ message: 'User deleted successfully' });
    });
});

module.exports = router;
