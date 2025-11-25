const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// GET /api/medical-records - Get medical records (filtered by role)
router.get('/', (req, res) => {
    let query;
    let params;

    if (req.user.role === 'patient') {
        // Patients see only their own records
        query = `
            SELECT 
                mr.*,
                d.full_name as doctor_name,
                d.specialization,
                a.appointment_date,
                a.appointment_time
            FROM medical_records mr
            LEFT JOIN doctors d ON mr.doctor_id = d.id
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            WHERE mr.patient_id = (SELECT id FROM patients WHERE user_id = ?)
            ORDER BY mr.created_at DESC
        `;
        params = [req.user.id];
    } else if (req.user.role === 'doctor') {
        // Doctors see records they created
        query = `
            SELECT 
                mr.*,
                p_user.name as patient_name,
                a.appointment_date,
                a.appointment_time
            FROM medical_records mr
            LEFT JOIN patients p ON mr.patient_id = p.id
            LEFT JOIN users p_user ON p.user_id = p_user.id
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            WHERE mr.doctor_id = (SELECT id FROM doctors WHERE user_id = ?)
            ORDER BY mr.created_at DESC
        `;
        params = [req.user.id];
    } else if (req.user.role === 'admin') {
        // Admin sees all records
        query = `
            SELECT 
                mr.*,
                d.full_name as doctor_name,
                p_user.name as patient_name,
                a.appointment_date
            FROM medical_records mr
            LEFT JOIN doctors d ON mr.doctor_id = d.id
            LEFT JOIN patients p ON mr.patient_id = p.id
            LEFT JOIN users p_user ON p.user_id = p_user.id
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            ORDER BY mr.created_at DESC
        `;
        params = [];
    } else {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('[Medical Records] GET error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// GET /api/medical-records/:id - Get specific medical record
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            mr.*,
            d.full_name as doctor_name,
            d.specialization,
            p_user.name as patient_name,
            a.appointment_date,
            a.appointment_time
        FROM medical_records mr
        LEFT JOIN doctors d ON mr.doctor_id = d.id
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users p_user ON p.user_id = p_user.id
        LEFT JOIN appointments a ON mr.appointment_id = a.id
        WHERE mr.id = ?
    `;

    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('[Medical Records] GET by ID error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        // Authorization check
        if (req.user.role === 'patient') {
            db.get('SELECT id FROM patients WHERE user_id = ?', [req.user.id], (err, patient) => {
                if (err || !patient || patient.id !== row.patient_id) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                res.json(row);
            });
        } else if (req.user.role === 'doctor') {
            db.get('SELECT id FROM doctors WHERE user_id = ?', [req.user.id], (err, doctor) => {
                if (err || !doctor || doctor.id !== row.doctor_id) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                res.json(row);
            });
        } else if (req.user.role === 'admin') {
            res.json(row);
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    });
});

// POST /api/medical-records - Create new medical record (doctor only)
router.post('/', authorizeRole('doctor'), (req, res) => {
    const { patient_id, appointment_id, diagnosis, treatment, notes } = req.body;

    if (!patient_id || !diagnosis) {
        return res.status(400).json({ error: 'Patient ID and diagnosis are required' });
    }

    // Get doctor ID from user
    db.get('SELECT id FROM doctors WHERE user_id = ?', [req.user.id], (err, doctor) => {
        if (err || !doctor) {
            console.error('[Medical Records] Doctor not found:', err);
            return res.status(500).json({ error: 'Doctor profile not found' });
        }

        const query = `
            INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.run(query, [patient_id, doctor.id, appointment_id, diagnosis, treatment, notes], function (err) {
            if (err) {
                console.error('[Medical Records] Create error:', err);
                return res.status(500).json({ error: 'Failed to create medical record' });
            }

            // Log action
            const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
            db.run(logQuery, [req.user.id, 'CREATE_MEDICAL_RECORD', `Created medical record #${this.lastID}`, req.ip]);

            // Auto-complete appointment and queue
            db.run('UPDATE appointments SET status = ? WHERE id = ?', ['completed', appointment_id]);
            db.run('UPDATE queues SET status = ? WHERE appointment_id = ?', ['completed', appointment_id]);

            res.status(201).json({
                id: this.lastID,
                message: 'Medical record created successfully'
            });
        });
    });
});

// PUT /api/medical-records/:id - Update medical record (doctor only)
router.put('/:id', authorizeRole('doctor'), (req, res) => {
    const { id } = req.params;
    const { diagnosis, treatment, notes } = req.body;

    // Get doctor ID and verify ownership
    db.get('SELECT id FROM doctors WHERE user_id = ?', [req.user.id], (err, doctor) => {
        if (err || !doctor) {
            return res.status(500).json({ error: 'Doctor profile not found' });
        }

        // Verify doctor owns this record
        db.get('SELECT * FROM medical_records WHERE id = ? AND doctor_id = ?', [id, doctor.id], (err, record) => {
            if (err) {
                console.error('[Medical Records] Update error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!record) {
                return res.status(404).json({ error: 'Medical record not found or unauthorized' });
            }

            const query = `
                UPDATE medical_records 
                SET diagnosis = ?, treatment = ?, notes = ?, updated_at = NOW()
                WHERE id = ?
            `;

            db.run(query, [diagnosis, treatment, notes, id], function (err) {
                if (err) {
                    console.error('[Medical Records] Update error:', err);
                    return res.status(500).json({ error: 'Failed to update medical record' });
                }

                // Log action
                const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
                db.run(logQuery, [req.user.id, 'UPDATE_MEDICAL_RECORD', `Updated medical record #${id}`, req.ip]);

                res.json({ message: 'Medical record updated successfully' });
            });
        });
    });
});

module.exports = router;
