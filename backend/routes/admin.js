const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check admin role
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
}

// GET /dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get total patients count
        const totalPatients = await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM patients", [], (err, row) => {
                if (err) reject(err);
                else resolve(row?.count || 0);
            });
        });

        // Get today's appointments count
        const today = new Date().toISOString().split('T')[0];
        const appointmentsToday = await new Promise((resolve, reject) => {
            db.get(
                "SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ?",
                [today],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row?.count || 0);
                }
            );
        });

        // Get active staff count (doctors + nurses)
        const activeStaff = await new Promise((resolve, reject) => {
            db.get(
                "SELECT COUNT(*) as count FROM users WHERE role IN ('doctor', 'nurse')",
                [],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row?.count || 0);
                }
            );
        });

        // Get today's revenue (sum of payments made today)
        const todayRevenue = await new Promise((resolve, reject) => {
            db.get(
                "SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE DATE(payment_date) = ?",
                [today],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row?.revenue || 0);
                }
            );
        });

        res.json({
            totalPatients,
            todayRevenue,
            activeStaff,
            appointmentsToday
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /users - Get all users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
    db.all("SELECT id, email, role, name, created_at FROM users", [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// POST /users - Create new user
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and get ID
        const userId = await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
                [email, hashedPassword, role, name],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Auto-create profile in respective table based on role
        if (role === 'doctor') {
            await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO doctors (user_id, full_name) VALUES (?, ?)",
                    [userId, name],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else if (role === 'nurse') {
            await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO nurses (user_id, full_name) VALUES (?, ?)",
                    [userId, name],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else if (role === 'patient') {
            await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO patients (user_id, full_name) VALUES (?, ?)",
                    [userId, name],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /users/:id - Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const userId = req.params.id;

    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// PUT /users/:id - Update user
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    const userId = req.params.id;
    const { email, password, role, name } = req.body;

    if (!email || !role || !name) {
        return res.status(400).json({ error: 'Email, role, and name are required' });
    }

    try {
        // Check if user exists
        const existingUser = await db.query('SELECT id FROM users WHERE id = ?', [userId]);

        if (!existingUser || existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If password is provided, hash it and update with password
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET email = ?, password_hash = ?, role = ?, name = ? WHERE id = ?',
                [email, hashedPassword, role, name, userId]
            );
        } else {
            // Update without changing password
            await db.query(
                'UPDATE users SET email = ?, role = ?, name = ? WHERE id = ?',
                [email, role, name, userId]
            );
        }

        // Sync changes to profile tables based on role
        if (role === 'doctor') {
            await db.query('UPDATE doctors SET full_name = ? WHERE user_id = ?', [name, userId]);
        } else if (role === 'nurse') {
            await db.query('UPDATE nurses SET full_name = ? WHERE user_id = ?', [name, userId]);
        } else if (role === 'patient') {
            await db.query('UPDATE patients SET full_name = ? WHERE user_id = ?', [name, userId]);
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /patients - Register new patient (Admin)
router.post('/patients', authenticateToken, requireAdmin, async (req, res) => {
    const { name, email, password, nik, phone, address, dob, gender, username } = req.body;

    if (!name || !email || !password || !nik || !username) {
        return res.status(400).json({ error: 'Name, Email, Password, NIK, and Username are required' });
    }

    try {
        // Check if email or username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM users WHERE email = ? OR username = ?",
                [email, username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email atau Username sudah terdaftar' });
        }

        // 1. Create User Account with username
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (email, username, password_hash, role, name) VALUES (?, ?, ?, 'patient', ?)",
                [email, username, hashedPassword, name],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // 2. Create Patient Record
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO patients (user_id, nik, phone, address, date_of_birth, gender) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, nik, phone, address, dob, gender],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /logs - Get audit logs
router.get('/logs', authenticateToken, requireAdmin, (req, res) => {
    const query = `
        SELECT l.*, u.email, u.name
        FROM audit_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.timestamp DESC
        LIMIT 100
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching logs:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

module.exports = router;
