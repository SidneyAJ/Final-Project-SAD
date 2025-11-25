const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/auth');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// GET /api/patients/profile - Get logged-in patient's profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get patient data
        const patient = await db.query(
            `SELECT p.*, u.email, u.name as user_name 
             FROM patients p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ?`,
            [userId]
        );

        if (!patient || patient.length === 0) {
            // Patient record doesn't exist yet - create one
            const userData = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

            if (!userData || userData.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create patient record
            await db.query(
                'INSERT INTO patients (user_id, full_name) VALUES (?, ?)',
                [userId, userData[0].name]
            );

            // Fetch newly created patient
            const newPatient = await db.query(
                `SELECT p.*, u.email, u.name as user_name 
                 FROM patients p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.user_id = ?`,
                [userId]
            );

            return res.json(newPatient[0]);
        }

        res.json(patient[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/patients/profile - Update logged-in patient's profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, date_of_birth, gender, phone, address, blood_type, allergies } = req.body;

        // Update patient data
        await db.query(
            `UPDATE patients 
             SET full_name = ?, date_of_birth = ?, gender = ?, phone = ?, 
                 address = ?, blood_type = ?, allergies = ? 
             WHERE user_id = ?`,
            [full_name, date_of_birth, gender, phone, address, blood_type, allergies, userId]
        );

        // Also update user name
        if (full_name) {
            await db.query('UPDATE users SET name = ? WHERE id = ?', [full_name, userId]);
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// GET /api/patients/appointments - Get patient's appointments
router.get('/appointments', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get patient ID
        const patient = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

        if (!patient || patient.length === 0) {
            return res.json([]);
        }

        const patientId = patient[0].id;

        // Get appointments with doctor info
        const appointments = await db.query(
            `SELECT a.*, d.full_name as doctor_name, d.specialization 
             FROM appointments a 
             JOIN doctors d ON a.doctor_id = d.id 
             WHERE a.patient_id = ? 
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [patientId]
        );

        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// POST /api/patients/appointments - Book new appointment
router.post('/appointments', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { doctor_id, appointment_date, appointment_time, notes } = req.body;

        // Validate input
        if (!doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({ error: 'Doctor, date, and time are required' });
        }

        // Get patient ID
        const patient = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

        if (!patient || patient.length === 0) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }

        const patientId = patient[0].id;

        // Create appointment
        const result = await db.query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status) 
             VALUES (?, ?, ?, ?, ?, 'scheduled')`,
            [patientId, doctor_id, appointment_date, appointment_time, notes || null]
        );

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointmentId: result.insertId
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// DELETE /api/patients/appointments/:id - Cancel appointment
router.delete('/appointments/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const appointmentId = req.params.id;

        // Get patient ID
        const patient = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

        if (!patient || patient.length === 0) {
            return res.status(404).json({ error: 'Patient profile not found' });
        }

        const patientId = patient[0].id;

        // Verify appointment belongs to this patient
        const appointment = await db.query(
            'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
            [appointmentId, patientId]
        );

        if (!appointment || appointment.length === 0) {
            return res.status(404).json({ error: 'Appointment not found or unauthorized' });
        }

        // Update status to cancelled instead of deleting
        await db.query(
            'UPDATE appointments SET status = ? WHERE id = ?',
            ['cancelled', appointmentId]
        );

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// GET /api/patients/doctors - Get list of doctors for appointment booking
router.get('/doctors', authenticateToken, async (req, res) => {
    try {
        const doctors = await db.query(
            'SELECT id, full_name, specialization, phone FROM doctors ORDER BY full_name'
        );

        res.json(doctors);
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// GET /api/patients/medical-records - Get patient's medical records
router.get('/medical-records', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get patient ID
        const patient = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

        if (!patient || patient.length === 0) {
            return res.json([]);
        }

        const patientId = patient[0].id;

        // Get medical records with doctor info
        const records = await db.query(
            `SELECT mr.*, d.full_name as doctor_name, d.specialization, a.appointment_date
             FROM medical_records mr
             JOIN doctors d ON mr.doctor_id = d.id
             LEFT JOIN appointments a ON mr.appointment_id = a.id
             WHERE mr.patient_id = ?
             ORDER BY mr.created_at DESC`,
            [patientId]
        );

        res.json(records);
    } catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
});

// POST /api/patients/medical-records - Create medical record (Doctor only)
router.post('/medical-records', authenticateToken, async (req, res) => {
    // Only doctors can create medical records
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { patient_id, appointment_id, diagnosis, treatment, notes } = req.body;
    const doctor_id = req.user.id; // Assuming doctor's user_id maps to doctor table via join, but for simplicity we might need doctor table id.

    // Get actual doctor ID from doctors table
    db.get("SELECT id FROM doctors WHERE user_id = ?", [req.user.id], (err, doctor) => {
        if (err || !doctor) return res.status(400).json({ error: 'Doctor profile not found' });

        const query = `
            INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [patient_id, doctor.id, appointment_id, diagnosis, treatment, notes], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const recordId = this.lastID;

            // AUTOMATIC BILLING TRIGGER: Consultation Fee
            const billQuery = "INSERT INTO payments (patient_id, amount, description, status) VALUES (?, ?, ?, 'pending')";
            const consultationFee = 150000; // Default fee

            db.run(billQuery, [patient_id, consultationFee, `Konsultasi Dokter - ${diagnosis}`, 'pending'], (err) => {
                if (err) console.error('Failed to create auto-bill:', err);
            });

            // Update appointment status to completed
            if (appointment_id) {
                db.run("UPDATE appointments SET status = 'completed' WHERE id = ?", [appointment_id]);
            }

            res.status(201).json({ message: 'Medical record created', id: recordId });
        });
    });
});

module.exports = router;
