const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// GET /api/prescriptions - Get prescriptions (filtered by role)
router.get('/', (req, res) => {
    let query;
    let params;

    if (req.user.role === 'patient') {
        // Patients see only their prescriptions
        query = `
            SELECT 
                p.*,
                d.full_name as doctor_name,
                d.specialization,
                a.appointment_date,
                mr.diagnosis
            FROM prescriptions p
            LEFT JOIN doctors d ON p.doctor_id = d.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            LEFT JOIN medical_records mr ON p.appointment_id = mr.appointment_id
            WHERE p.patient_id = (SELECT id FROM patients WHERE user_id = ?)
            ORDER BY p.created_at DESC
        `;
        params = [req.user.id];
    } else if (req.user.role === 'doctor') {
        // Doctors see prescriptions they created
        query = `
            SELECT 
                p.*,
                pt_user.name as patient_name,
                a.appointment_date,
                mr.diagnosis
            FROM prescriptions p
            LEFT JOIN patients pt ON p.patient_id = pt.id
            LEFT JOIN users pt_user ON pt.user_id = pt_user.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            LEFT JOIN medical_records mr ON p.appointment_id = mr.appointment_id
            WHERE p.doctor_id = (SELECT id FROM doctors WHERE user_id = ?)
            ORDER BY p.created_at DESC
        `;
        params = [req.user.id];
    } else if (req.user.role === 'pharmacist' || req.user.role === 'admin') {
        // Pharmacist/Admin see all prescriptions
        query = `
            SELECT 
                p.*,
                d.full_name as doctor_name,
                pt_user.name as patient_name,
                a.appointment_date,
                mr.diagnosis
            FROM prescriptions p
            LEFT JOIN doctors d ON p.doctor_id = d.id
            LEFT JOIN patients pt ON p.patient_id = pt.id
            LEFT JOIN users pt_user ON pt.user_id = pt_user.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            LEFT JOIN medical_records mr ON p.appointment_id = mr.appointment_id
            ORDER BY p.created_at DESC
        `;
        params = [];
    } else {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('[Prescriptions] GET error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // Parse medications JSON
        const prescriptions = rows.map(row => ({
            ...row,
            medications: row.medications ? JSON.parse(row.medications) : []
        }));
        res.json(prescriptions);
    });
});

// POST /api/prescriptions - Create new prescription (doctor only)
router.post('/', authorizeRole('doctor'), (req, res) => {
    const { patient_id, appointment_id, medications, notes } = req.body;

    if (!patient_id || !medications || medications.length === 0) {
        return res.status(400).json({ error: 'Patient ID and medications are required' });
    }

    // Get doctor ID from user
    db.get('SELECT id FROM doctors WHERE user_id = ?', [req.user.id], (err, doctor) => {
        if (err || !doctor) {
            console.error('[Prescriptions] Doctor not found:', err);
            return res.status(500).json({ error: 'Doctor profile not found' });
        }

        const query = `
            INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, medications, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `;

        db.run(query, [patient_id, doctor.id, appointment_id, JSON.stringify(medications), notes], function (err) {
            if (err) {
                console.error('[Prescriptions] Create error:', err);
                return res.status(500).json({ error: 'Failed to create prescription' });
            }

            // Log action
            const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
            db.run(logQuery, [req.user.id, 'CREATE_PRESCRIPTION', `Created prescription #${this.lastID}`, req.ip]);

            res.status(201).json({
                id: this.lastID,
                message: 'Prescription created successfully'
            });
        });
    });
});

// PUT /api/prescriptions/:id/status - Update prescription status (pharmacist)
router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'verified', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `UPDATE prescriptions SET status = ?, updated_at = NOW() WHERE id = ?`;

    db.run(query, [status, id], function (err) {
        if (err) {
            console.error('[Prescriptions] Status update error:', err);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        // Log action
        const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
        db.run(logQuery, [req.user.id, 'UPDATE_PRESCRIPTION_STATUS', `Updated prescription #${id} to ${status}`, req.ip]);

        res.json({ message: 'Prescription status updated' });
    });
});

module.exports = router;
