const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Middleware - all routes require doctor authentication
router.use(authenticateToken);
router.use(authorizeRole('doctor'));

// Helper function to get doctor ID from user ID
async function getDoctorId(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM doctors WHERE user_id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else if (!row) reject(new Error('Doctor profile not found'));
            else resolve(row.id);
        });
    });
}

// GET /api/doctors/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const date = new Date();
        const today = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');

        // Get today's appointments count
        const todayAppointmentsQuery = `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
        `;

        // Get active queue size (patients waiting)
        const queueSizeQuery = `
            SELECT COUNT(*) as count 
            FROM queues q
            JOIN appointments a ON q.appointment_id = a.id
            WHERE a.doctor_id = ? AND q.status = 'waiting'
        `;

        // Get patients treated today
        const patientsTreatedQuery = `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? AND status = 'completed'
        `;

        // Get pending records (consultations without medical records)
        const pendingRecordsQuery = `
            SELECT COUNT(*) as count 
            FROM appointments a
            LEFT JOIN medical_records mr ON a.id = mr.appointment_id
            WHERE a.doctor_id = ? AND a.appointment_date = ? 
            AND a.status = 'completed' AND mr.id IS NULL
        `;

        // Get recent activity (last 5 completed appointments)
        const recentActivityQuery = `
            SELECT 
                a.id,
                a.status,
                a.updated_at,
                p.name as patient_name,
                mr.diagnosis,
                a.appointment_time
            FROM appointments a
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN medical_records mr ON a.id = mr.appointment_id
            WHERE a.doctor_id = ? AND a.status IN ('completed', 'in_consultation')
            ORDER BY a.updated_at DESC
            LIMIT 5
        `;

        // Get upcoming appointments (next 3)
        const upcomingAppointmentsQuery = `
            SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.notes,
                p.name as patient_name,
                q.queue_number
            FROM appointments a
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN queues q ON a.id = q.appointment_id
            WHERE a.doctor_id = ? AND a.appointment_date >= ? AND a.status = 'confirmed'
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 3
        `;

        // Execute all queries
        const [
            todayAppointments,
            queueSize,
            patientsTreated,
            pendingRecords,
            recentActivity,
            upcomingAppointments
        ] = await Promise.all([
            new Promise((resolve, reject) => {
                db.get(todayAppointmentsQuery, [doctorId, today], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            }),
            new Promise((resolve, reject) => {
                db.get(queueSizeQuery, [doctorId, today], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            }),
            new Promise((resolve, reject) => {
                db.get(patientsTreatedQuery, [doctorId, today], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            }),
            new Promise((resolve, reject) => {
                db.get(pendingRecordsQuery, [doctorId, today], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(recentActivityQuery, [doctorId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(upcomingAppointmentsQuery, [doctorId, today], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            })
        ]);

        res.json({
            todayAppointments,
            queueSize,
            patientsTreated,
            pendingRecords,
            recentActivity,
            upcomingAppointments
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// POST /api/doctors/consultations/start - Start consultation
router.post('/consultations/start', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { appointment_id, patient_id } = req.body;

        if (!appointment_id || !patient_id) {
            return res.status(400).json({ error: 'Appointment ID and Patient ID are required' });
        }

        const date = new Date();
        const today = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');

        // Validate appointment exists, is for today, and belongs to this doctor
        const appointmentQuery = `
            SELECT * FROM appointments 
            WHERE id = ? AND doctor_id = ? AND patient_id = ? AND appointment_date = ?
        `;

        db.get(appointmentQuery, [appointment_id, doctorId, patient_id, today], (err, appointment) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!appointment) {
                return res.status(404).json({ error: 'Janji temu tidak ditemukan atau bukan untuk hari ini' });
            }

            // Validate patient has queue number
            const queueQuery = `SELECT * FROM queues WHERE appointment_id = ? AND status = 'waiting'`;

            db.get(queueQuery, [appointment_id], (err, queue) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (!queue) {
                    return res.status(400).json({ error: 'Pasien harus mengambil nomor antrean terlebih dahulu' });
                }

                // Check if there's already an active consultation
                db.get('SELECT * FROM consultations WHERE appointment_id = ? AND status = "in_progress"',
                    [appointment_id], (err, existing) => {
                        if (err) return res.status(500).json({ error: 'Database error' });
                        if (existing) {
                            return res.status(400).json({ error: 'Konsultasi sudah berlangsung' });
                        }

                        // Create consultation record
                        const insertQuery = `
                        INSERT INTO consultations (patient_id, doctor_id, appointment_id, started_at, status)
                        VALUES (?, ?, ?, NOW(), 'in_progress')
                    `;

                        db.run(insertQuery, [patient_id, doctorId, appointment_id], function (err) {
                            if (err) return res.status(500).json({ error: 'Failed to start consultation' });

                            const consultationId = this.lastID;

                            // Update appointment status
                            db.run('UPDATE appointments SET status = ? WHERE id = ?',
                                ['in_consultation', appointment_id]);

                            // Update queue status
                            db.run('UPDATE queues SET status = ? WHERE id = ?', ['called', queue.id]);

                            res.status(201).json({
                                message: 'Konsultasi dimulai',
                                consultation_id: consultationId,
                                patient_id,
                                queue_number: queue.queue_number
                            });
                        });
                    });
            });
        });

    } catch (error) {
        console.error('Start consultation error:', error);
        res.status(500).json({ error: 'Failed to start consultation' });
    }
});

// POST /api/doctors/consultations/:id/complete - Complete consultation
router.post('/consultations/:id/complete', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const consultationId = req.params.id;

        // Verify consultation belongs to this doctor and is in progress
        db.get('SELECT * FROM consultations WHERE id = ? AND doctor_id = ? AND status = "in_progress"',
            [consultationId, doctorId], (err, consultation) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (!consultation) {
                    return res.status(404).json({ error: 'Konsultasi tidak ditemukan atau sudah selesai' });
                }

                // Update consultation
                const updateQuery = `
                UPDATE consultations 
                SET ended_at = NOW(),
                    duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW()),
                    status = 'completed'
                WHERE id = ?
            `;

                db.run(updateQuery, [consultationId], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to complete consultation' });

                    // Update appointment status
                    db.run('UPDATE appointments SET status = ? WHERE id = ?',
                        ['completed', consultation.appointment_id]);

                    // Update queue status
                    db.run('UPDATE queues SET status = ? WHERE appointment_id = ?',
                        ['completed', consultation.appointment_id]);

                    res.json({
                        message: 'Konsultasi selesai',
                        consultation_id: consultationId,
                        next_step: 'create_medical_record'
                    });
                });
            });

    } catch (error) {
        console.error('Complete consultation error:', error);
        res.status(500).json({ error: 'Failed to complete consultation' });
    }
});

// GET /api/doctors/queue/current - Get current queue for doctor's appointments
router.get('/queue/current', async (req, res) => {
    console.log('[Queue] Fetching current queue for user:', req.user.id);
    try {
        const doctorId = await getDoctorId(req.user.id);
        console.log('[Queue] Doctor ID:', doctorId);

        const date = new Date();
        const today = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');

        console.log('[Queue] Target Date:', today);

        // Get all queue entries for today's appointments with this doctor
        const queueQuery = `
            SELECT 
                q.id as queue_id,
                q.queue_number,
                q.status as queue_status,
                q.created_at,
                a.id as appointment_id,
                a.patient_id,
                a.appointment_time,
                a.notes,
                a.status as appointment_status,
                p.name as patient_name,
                pat.phone
            FROM queues q
            JOIN appointments a ON q.appointment_id = a.id
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            WHERE a.doctor_id = ? AND DATE(a.appointment_date) = ?
            ORDER BY q.queue_number ASC
        `;

        db.all(queueQuery, [doctorId, today], (err, queueList) => {
            if (err) {
                console.error('[Queue] Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            console.log('[Queue] Found entries:', queueList ? queueList.length : 0);
            if (queueList.length > 0) {
                console.log('[Queue] Statuses:', queueList.map(q => `${q.queue_number}: ${q.queue_status}`));
            }

            // Find current serving and next
            const waiting = queueList.filter(q => q.queue_status === 'waiting');
            const called = queueList.filter(q => q.queue_status === 'called');
            const currentServing = called.length > 0 ? called[0] : null;
            const nextInLine = waiting.length > 0 ? waiting[0] : null;

            res.json({
                currentServing,
                nextInLine,
                queueList,
                summary: {
                    total: queueList.length,
                    waiting: waiting.length,
                    called: called.length,
                    completed: queueList.filter(q => q.queue_status === 'completed').length,
                    noShow: queueList.filter(q => q.queue_status === 'no_show').length
                }
            });
        });

    } catch (error) {
        console.error('Get current queue error:', error);
        res.status(500).json({ error: 'Failed to fetch current queue' });
    }
});

// POST /api/doctors/queue/call-next - Call next patient
router.post('/queue/call-next', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const date = new Date();
        const today = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');

        // Find next waiting patient for this doctor
        console.log(`[CallNext] Doctor: ${doctorId}, Date: ${today}`);
        const nextQuery = `
            SELECT q.id, q.queue_number, q.appointment_id, p.name as patient_name
            FROM queues q
            JOIN appointments a ON q.appointment_id = a.id
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            WHERE a.doctor_id = ? AND DATE(a.appointment_date) = ? AND q.status = 'waiting'
            ORDER BY q.queue_number ASC
            LIMIT 1
        `;

        db.get(nextQuery, [doctorId, today], (err, nextPatient) => {
            if (err) {
                console.error('[CallNext] Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!nextPatient) {
                console.log('[CallNext] No waiting patients found');
                return res.status(404).json({ error: 'Tidak ada pasien dalam antrean' });
            }

            console.log(`[CallNext] Found patient: ${nextPatient.patient_name} (Queue: ${nextPatient.queue_number}, ID: ${nextPatient.id})`);

            // Update queue status to completed (patient is done)
            db.run('UPDATE queues SET status = ? WHERE id = ?', ['completed', nextPatient.id], function (err) {
                if (err) {
                    console.error('[CallNext] Update error:', err);
                    return res.status(500).json({ error: 'Failed to call patient' });
                }
                console.log(`[CallNext] Updated queue status. Changes: ${this.changes}`);

                // Update appointment status to completed
                db.run('UPDATE appointments SET status = ? WHERE id = ?',
                    ['completed', nextPatient.appointment_id], function (err) {
                        console.log(`[CallNext] Updated appointment status. Changes: ${this.changes}`);

                        res.json({
                            message: 'Pasien dipanggil dan ditandai selesai',
                            queue_number: nextPatient.queue_number,
                            patient_name: nextPatient.patient_name,
                            appointment_id: nextPatient.appointment_id
                        });
                    });
            });
        });

    } catch (error) {
        console.error('Call next patient error:', error);
        res.status(500).json({ error: 'Failed to call next patient' });
    }
});

// POST /api/doctors/queue/:id/skip - Mark patient as no-show
router.post('/queue/:id/skip', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const queueId = req.params.id;

        // Verify queue belongs to this doctor's appointment
        const verifyQuery = `
            SELECT q.*, a.doctor_id, a.id as appointment_id
            FROM queues q
            JOIN appointments a ON q.appointment_id = a.id
            WHERE q.id = ?
        `;

        db.get(verifyQuery, [queueId], (err, queue) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!queue) {
                return res.status(404).json({ error: 'Antrean tidak ditemukan' });
            }
            if (queue.doctor_id !== doctorId) {
                return res.status(403).json({ error: 'Akses ditolak' });
            }

            // Update queue status to no_show
            db.run('UPDATE queues SET status = ? WHERE id = ?', ['no_show', queueId], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to skip patient' });

                // Update appointment status to no_show
                db.run('UPDATE appointments SET status = ? WHERE id = ?',
                    ['no_show', queue.appointment_id]);

                res.json({
                    message: 'Pasien ditandai tidak hadir',
                    queue_number: queue.queue_number
                });
            });
        });

    } catch (error) {
        console.error('Skip patient error:', error);
        res.status(500).json({ error: 'Failed to skip patient' });
    }
});

// GET /api/doctors/medical-records - Get all medical records created by this doctor
router.get('/medical-records', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { patient_id, date_from, date_to, diagnosis } = req.query;

        let query = `
            SELECT 
                mr.*,
                p.name as patient_name,
                pat.phone,
                pat.nik,
                a.appointment_date,
                a.appointment_time
            FROM medical_records mr
            JOIN patients pat ON mr.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            WHERE mr.doctor_id = ?
        `;
        const params = [doctorId];

        // Optional filters
        if (patient_id) {
            query += ' AND mr.patient_id = ?';
            params.push(patient_id);
        }
        if (date_from) {
            query += ' AND mr.created_at >= ?';
            params.push(date_from);
        }
        if (date_to) {
            query += ' AND mr.created_at <= ?';
            params.push(date_to);
        }
        if (diagnosis) {
            query += ' AND mr.diagnosis LIKE ?';
            params.push(`%${diagnosis}%`);
        }

        query += ' ORDER BY mr.created_at DESC';

        db.all(query, params, (err, records) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(records);
        });

    } catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
});

// GET /api/doctors/completed-patients - Get completed patients without medical records
router.get('/completed-patients', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);

        const query = `
            SELECT 
                a.id as appointment_id,
                a.patient_id,
                a.appointment_date,
                a.appointment_time,
                p.name as patient_name,
                pat.phone,
                pat.nik,
                q.queue_number
            FROM appointments a
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN queues q ON a.id = q.appointment_id
            LEFT JOIN medical_records mr ON a.id = mr.appointment_id
            WHERE a.doctor_id = ? 
              AND a.status = 'completed'
              AND mr.id IS NULL
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT 50
        `;

        db.all(query, [doctorId], (err, patients) => {
            if (err) {
                console.error('Get completed patients error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(patients);
        });

    } catch (error) {
        console.error('Get completed patients error:', error);
        res.status(500).json({ error: 'Failed to fetch completed patients' });
    }
});

// GET /api/doctors/medical-records/:id - Get specific medical record
router.get('/medical-records/:id', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const recordId = req.params.id;

        const query = `
            SELECT 
                mr.*,
                p.name as patient_name,
                pat.phone,
                pat.nik,
                pat.date_of_birth,
                pat.gender,
                a.appointment_date,
                a.appointment_time
            FROM medical_records mr
            JOIN patients pat ON mr.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            WHERE mr.id = ? AND mr.doctor_id = ?
        `;

        db.get(query, [recordId, doctorId], (err, record) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!record) {
                return res.status(404).json({ error: 'Rekam medis tidak ditemukan' });
            }
            res.json(record);
        });

    } catch (error) {
        console.error('Get medical record error:', error);
        res.status(500).json({ error: 'Failed to fetch medical record' });
    }
});

// GET /api/doctors/appointments - Get appointments for this doctor
router.get('/appointments', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { date, status } = req.query;

        let query = `
            SELECT 
                a.*,
                p.name as patient_name,
                pat.phone,
                pat.nik,
                q.queue_number,
                q.status as queue_status
            FROM appointments a
            JOIN patients pat ON a.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN queues q ON a.id = q.appointment_id
            WHERE a.doctor_id = ?
        `;
        const params = [doctorId];

        // Optional filters
        if (date) {
            query += ' AND a.appointment_date = ?';
            params.push(date);
        }
        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        db.all(query, params, (err, appointments) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(appointments);
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// GET /api/doctors/prescriptions - Get prescriptions created by this doctor
router.get('/prescriptions', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { patient_id, status, date_from, date_to } = req.query;

        let query = `
            SELECT 
                pr.*,
                p.name as patient_name,
                pat.phone,
                mr.diagnosis
            FROM prescriptions pr
            JOIN patients pat ON pr.patient_id = pat.id
            JOIN users p ON pat.user_id = p.id
            LEFT JOIN medical_records mr ON pr.medical_record_id = mr.id
            WHERE pr.doctor_id = ?
        `;
        const params = [doctorId];

        // Optional filters
        if (patient_id) {
            query += ' AND pr.patient_id = ?';
            params.push(patient_id);
        }
        if (status) {
            query += ' AND pr.status = ?';
            params.push(status);
        }
        if (date_from) {
            query += ' AND pr.created_at >= ?';
            params.push(date_from);
        }
        if (date_to) {
            query += ' AND pr.created_at <= ?';
            params.push(date_to);
        }

        query += ' ORDER BY pr.created_at DESC';

        db.all(query, params, (err, prescriptions) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(prescriptions);
        });

    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
});

// GET /api/doctors/patients - Get all patients treated by this doctor
router.get('/patients', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);

        const query = `
            SELECT 
                pat.id as patient_id,
                p.name as patient_name,
                pat.phone,
                pat.nik,
                pat.date_of_birth,
                pat.gender,
                COUNT(DISTINCT mr.id) as total_visits,
                MAX(mr.created_at) as last_visit,
                GROUP_CONCAT(DISTINCT mr.diagnosis) as diagnoses
            FROM patients pat
            JOIN users p ON pat.user_id = p.id
            JOIN medical_records mr ON pat.id = mr.patient_id
            WHERE mr.doctor_id = ?
            GROUP BY pat.id, p.name, pat.phone, pat.nik, pat.date_of_birth, pat.gender
            ORDER BY last_visit DESC
        `;

        db.all(query, [doctorId], (err, patients) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(patients);
        });

    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// GET /api/doctors/patients/:id/history - Get patient's history with this doctor
router.get('/patients/:id/history', async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const patientId = req.params.id;

        // Get all medical records for this patient with this doctor
        const recordsQuery = `
            SELECT 
                mr.*,
                a.appointment_date,
                a.appointment_time
            FROM medical_records mr
            LEFT JOIN appointments a ON mr.appointment_id = a.id
            WHERE mr.patient_id = ? AND mr.doctor_id = ?
            ORDER BY mr.created_at DESC
        `;

        // Get all prescriptions for this patient from this doctor
        const prescriptionsQuery = `
            SELECT * FROM prescriptions
            WHERE patient_id = ? AND doctor_id = ?
            ORDER BY created_at DESC
        `;

        // Get all appointments
        const appointmentsQuery = `
            SELECT * FROM appointments 
            WHERE patient_id = ? AND doctor_id = ?
            ORDER BY appointment_date DESC, appointment_time DESC
        `;

        Promise.all([
            new Promise((resolve, reject) => {
                db.all(recordsQuery, [patientId, doctorId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(prescriptionsQuery, [patientId, doctorId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(appointmentsQuery, [patientId, doctorId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            })
        ]).then(([medicalRecords, prescriptions, appointments]) => {
            res.json({
                medicalRecords,
                prescriptions,
                appointments,
                summary: {
                    totalVisits: medicalRecords.length,
                    totalPrescriptions: prescriptions.length,
                    totalAppointments: appointments.length
                }
            });
        }).catch(error => {
            console.error('Get patient history error:', error);
            res.status(500).json({ error: 'Failed to fetch patient history' });
        });

    } catch (error) {
        console.error('Get patient history error:', error);
        res.status(500).json({ error: 'Failed to fetch patient history' });
    }
});

module.exports = router;

