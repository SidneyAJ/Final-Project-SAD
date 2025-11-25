const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const logAudit = require('../utils/auditLogger');

const router = express.Router();

router.use(authenticateToken);

// Get All Appointments (Filtered by Role)
router.get('/', (req, res) => {
    let query = `
        SELECT 
            a.id, 
            a.appointment_date, 
            a.appointment_time, 
            a.status, 
            a.notes,
            p.full_name as patient_name,
            d.full_name as doctor_name,
            d.specialization as doctor_specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
    `;

    const params = [];

    // Data Isolation: Patients can only see their own appointments
    if (req.user.role === 'patient') {
        query += ` WHERE p.user_id = ?`;
        params.push(req.user.id);
    } else if (req.user.role === 'doctor') {
        // Doctors can only see appointments assigned to them
        query += ` JOIN users u ON d.user_id = u.id WHERE u.id = ?`;
        params.push(req.user.id);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Appointment
router.post('/', (req, res) => {
    const { doctor_id, appointment_date, appointment_time, notes } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Get patient_id from logged in user
    db.get('SELECT id FROM patients WHERE user_id = ?', [req.user.id], (err, patient) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!patient) return res.status(404).json({ error: 'Patient profile not found. Please complete your profile.' });

        const patient_id = patient.id;

        // Validation 1: Prevent booking past dates (Allow today if time is future, or just warn)
        // Simplified: Just check if date is in the past (yesterday or before)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(appointment_date);

        if (bookingDate < today) {
            return res.status(400).json({ error: 'Tidak dapat membuat janji di tanggal yang sudah lewat' });
        }

        // Validation 2: Check for schedule conflicts
        const conflictQuery = `
            SELECT id FROM appointments 
            WHERE doctor_id = ? 
            AND appointment_date = ? 
            AND appointment_time = ? 
            AND status != 'cancelled'
        `;

        db.get(conflictQuery, [doctor_id, appointment_date, appointment_time], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                return res.status(409).json({ error: 'Jadwal dokter sudah terisi pada waktu tersebut' });
            }

            // No conflict, proceed to insert
            db.run(
                "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status) VALUES (?, ?, ?, ?, ?, 'pending')",
                [patient_id, doctor_id, appointment_date, appointment_time, notes],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    const appointmentId = this.lastID;
                    logAudit(req, 'CREATE_APPOINTMENT', { appointment_id: appointmentId, patient_id, doctor_id });

                    // Auto-create queue if appointment is for today
                    // Helper to get YYYY-MM-DD string in local time
                    const toLocalYMD = (d) => {
                        const date = new Date(d);
                        return date.getFullYear() + '-' +
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');
                    };

                    const appDateStr = toLocalYMD(appointment_date);
                    const todayStr = toLocalYMD(new Date());

                    if (appDateStr === todayStr) {
                        // Get patient name for queue
                        db.get('SELECT u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?', [patient_id], (err, patientData) => {
                            if (err || !patientData) {
                                return res.status(201).json({ message: 'Appointment created successfully', id: appointmentId });
                            }

                            // Get next queue number for today
                            db.get(
                                "SELECT MAX(queue_number) as last_number FROM queues WHERE DATE(created_at) = CURDATE()",
                                [],
                                (err, queueRow) => {
                                    if (err) {
                                        console.error('Error getting queue number:', err);
                                        return res.status(201).json({ message: 'Appointment created successfully', id: appointmentId });
                                    }

                                    const nextQueueNumber = (queueRow && queueRow.last_number) ? queueRow.last_number + 1 : 1;

                                    // Insert into queue
                                    db.run(
                                        "INSERT INTO queues (appointment_id, patient_name, queue_number, status, created_at) VALUES (?, ?, ?, 'waiting', NOW())",
                                        [appointmentId, patientData.name, nextQueueNumber],
                                        (err) => {
                                            if (err) console.error('Error creating queue:', err);

                                            res.status(201).json({
                                                message: 'Appointment created successfully with queue number',
                                                id: appointmentId,
                                                queue_number: nextQueueNumber
                                            });
                                        }
                                    );
                                }
                            );
                        });
                    } else {
                        res.status(201).json({ message: 'Appointment created successfully', id: appointmentId });
                    }
                }
            );
        });
    });
});

// Update Appointment Status
router.put('/:id', (req, res) => {
    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'postponed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.get('SELECT * FROM appointments WHERE id = ?', [appointmentId], (err, appointment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        // Update status
        db.run(
            "UPDATE appointments SET status = ? WHERE id = ?",
            [status, appointmentId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                logAudit(req, 'UPDATE_APPOINTMENT_STATUS', { appointment_id: appointmentId, status });

                // Auto-create queue if confirmed and date is today
                if (status === 'confirmed') {
                    // Helper to get YYYY-MM-DD string in local time
                    const toLocalYMD = (d) => {
                        const date = new Date(d);
                        return date.getFullYear() + '-' +
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');
                    };

                    const appDateStr = toLocalYMD(appointment.appointment_date);
                    const todayStr = toLocalYMD(new Date());

                    if (appDateStr === todayStr) {
                        // Check if queue already exists
                        db.get('SELECT id FROM queues WHERE appointment_id = ?', [appointmentId], (err, queueRow) => {
                            if (!queueRow) {
                                // Get patient name
                                db.get('SELECT u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?', [appointment.patient_id], (err, patientData) => {
                                    if (patientData) {
                                        // Get next queue number
                                        db.get("SELECT MAX(queue_number) as last_number FROM queues WHERE DATE(created_at) = CURDATE()", [], (err, row) => {
                                            const nextNumber = (row && row.last_number) ? row.last_number + 1 : 1;

                                            db.run(
                                                "INSERT INTO queues (appointment_id, patient_name, queue_number, status, created_at) VALUES (?, ?, ?, 'waiting', NOW())",
                                                [appointmentId, patientData.name, nextNumber],
                                                (err) => {
                                                    if (err) console.error('Error auto-creating queue:', err);
                                                    else console.log(`Auto-created queue #${nextNumber} for appointment ${appointmentId}`);
                                                }
                                            );
                                        });
                                    }
                                });
                            }
                        });
                    }
                }

                res.json({ message: 'Appointment status updated' });
            }
        );
    });
});

// Delete Appointment
router.delete('/:id', (req, res) => {
    const appointmentId = req.params.id;

    db.run("DELETE FROM appointments WHERE id = ?", [appointmentId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Appointment not found' });

        logAudit(req, 'DELETE_APPOINTMENT', { appointment_id: appointmentId });
        res.json({ message: 'Appointment deleted successfully' });
    });
});

module.exports = router;
