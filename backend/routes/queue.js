const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Helper to get today's range in UTC for created_at queries
const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
        start: start.toISOString(), // UTC ISO string
        end: end.toISOString(),     // UTC ISO string
        dateStr: start.getFullYear() + '-' +
            String(start.getMonth() + 1).padStart(2, '0') + '-' +
            String(start.getDate()).padStart(2, '0') // Local YYYY-MM-DD
    };
};

// Get queue status (Isolated)
router.get('/', authenticateToken, (req, res) => {
    const { start, end, dateStr } = getTodayRange();

    // If admin/nurse, return full list
    if (['admin', 'nurse'].includes(req.user.role)) {
        const query = `
            SELECT q.*, a.appointment_time, d.full_name as doctor_name
            FROM queues q
            LEFT JOIN appointments a ON q.appointment_id = a.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE q.created_at >= ? AND q.created_at <= ?
            ORDER BY q.queue_number ASC
        `;
        return db.all(query, [start, end], (err, rows) => {
            if (err) {
                console.error('Error fetching queue (admin/nurse):', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        });
    }

    // If patient, return ONLY their queue + current serving info
    const myQueueQuery = `
        SELECT q.*, a.appointment_time, d.full_name as doctor_name
        FROM queues q
        JOIN appointments a ON q.appointment_id = a.id
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE q.created_at >= ? AND q.created_at <= ?
        AND p.user_id = ?
        AND q.status != 'completed'
        ORDER BY 
            CASE 
                WHEN q.status = 'serving' THEN 1
                WHEN q.status = 'waiting' THEN 2
                ELSE 3
            END,
            q.created_at DESC
        LIMIT 1
    `;

    const currentServingQuery = `
        SELECT queue_number FROM queues 
        WHERE created_at >= ? AND created_at <= ?
        AND status = 'serving' 
        ORDER BY created_at DESC LIMIT 1
    `;

    const totalQueueQuery = `
        SELECT COUNT(*) as total FROM queues 
        WHERE created_at >= ? AND created_at <= ?
        AND status IN ('waiting', 'serving')
    `;

    db.get(myQueueQuery, [start, end, req.user.id], (err, myQueue) => {
        if (err) {
            console.error('Error fetching myQueue:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Debug logging
        console.log(`[GET /api/queue] User ${req.user.id}:`, {
            myQueue: myQueue ? `#${myQueue.queue_number} (${myQueue.status})` : 'null',
            raw: myQueue
        });

        db.get(currentServingQuery, [start, end], (err, serving) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.get(totalQueueQuery, [start, end], (err, total) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                const response = {
                    myQueue: myQueue || null,
                    currentServing: serving ? serving.queue_number : null,
                    totalQueues: total ? total.total : 0
                };

                console.log(`[GET /api/queue] Response for user ${req.user.id}:`, JSON.stringify(response));

                res.json(response);
            });
        });
    });
});


// Add to queue (from appointment)
router.post('/', authenticateToken, (req, res) => {
    const { appointment_id, patient_name } = req.body;
    const { start, end, dateStr } = getTodayRange();

    // Validation: Check if appointment exists for today
    db.get(
        `SELECT * FROM appointments WHERE id = ? AND appointment_date = ?`,
        [appointment_id, dateStr],
        (err, appointment) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!appointment) {
                return res.status(400).json({ error: 'Hanya bisa mengambil antrean untuk janji temu hari ini' });
            }

            // Check if there's already a queue for this appointment today
            db.get(
                `SELECT * FROM queues WHERE appointment_id = ? AND created_at >= ? AND created_at <= ?`,
                [appointment_id, start, end],
                (err, existingQueue) => {
                    if (err) return res.status(500).json({ error: 'Database error' });

                    // If queue exists and NOT completed, don't allow duplicate
                    if (existingQueue && existingQueue.status !== 'completed') {
                        return res.status(400).json({
                            error: 'Anda sudah memiliki nomor antrean untuk janji temu ini',
                            queue_number: existingQueue.queue_number
                        });
                    }

                    // If queue completed or doesn't exist, allow new queue
                    // Get the last queue number for today
                    db.get(`SELECT MAX(queue_number) as last_number FROM queues WHERE created_at >= ? AND created_at <= ?`,
                        [start, end],
                        (err, row) => {
                            if (err) return res.status(500).json({ error: 'Database error' });

                            const nextNumber = (row && row.last_number) ? row.last_number + 1 : 1;

                            const query = `INSERT INTO queues (appointment_id, patient_name, queue_number, status) VALUES (?, ?, ?, 'waiting')`;
                            db.run(query, [appointment_id, patient_name, nextNumber], function (err) {
                                if (err) {
                                    console.error('Error adding to queue:', err);
                                    return res.status(500).json({ error: 'Failed to add to queue' });
                                }

                                // Log action
                                const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
                                db.run(logQuery, [req.user.id, 'ADD_QUEUE', `Added ${patient_name} to queue #${nextNumber}`, req.ip]);

                                res.status(201).json({
                                    id: this.lastID,
                                    queue_number: nextNumber,
                                    appointment_id: appointment_id,
                                    message: 'Berhasil mengambil nomor antrean'
                                });
                            });
                        });
                }
            );
        }
    );
});

// Add walk-in queue (Random Doctor)
router.post('/walkin', authenticateToken, (req, res) => {
    console.log('[Walk-in] ========== ROUTE HIT ==========');
    console.log('[Walk-in] Headers:', req.headers);
    console.log('[Walk-in] Body:', req.body);
    console.log('[Walk-in] User:', req.user ? req.user.id : 'NO USER');

    const { patient_name } = req.body;
    const { start, end, dateStr } = getTodayRange();

    console.log('[Walk-in] Request from user:', req.user.id, 'Patient name:', patient_name);

    // 0. Verify patient record exists
    db.get('SELECT id FROM patients WHERE user_id = ?', [req.user.id], (err, patientRecord) => {
        if (err) {
            console.error('[Walk-in] Error checking patient:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!patientRecord) {
            console.error('[Walk-in] Patient record not found for user:', req.user.id);
            return res.status(400).json({ error: 'Profil pasien tidak ditemukan. Silakan hubungi admin.' });
        }

        const patientId = patientRecord.id;
        console.log('[Walk-in] Patient ID:', patientId);

        // 1. Pick a random doctor
        db.get('SELECT id FROM doctors ORDER BY RAND() LIMIT 1', [], (err, doctor) => {
            if (err) {
                console.error('[Walk-in] Error selecting doctor:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!doctor) {
                console.error('[Walk-in] No doctors available');
                return res.status(500).json({ error: 'Tidak ada dokter tersedia saat ini' });
            }

            const doctorId = doctor.id;
            console.log('[Walk-in] Selected doctor ID:', doctorId);

            // 2. Create Appointment (Confirmed)
            const appointmentQuery = `
                INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes, created_at)
                VALUES (?, ?, ?, TIME(NOW()), 'confirmed', 'Walk-in Queue', NOW())
            `;

            db.run(appointmentQuery, [patientId, doctorId, dateStr], function (err) {
                if (err) {
                    console.error('[Walk-in] Error creating appointment:', err);
                    return res.status(500).json({ error: 'Gagal membuat janji temu' });
                }
                const appointmentId = this.lastID;
                console.log('[Walk-in] Created appointment ID:', appointmentId);

                // 3. Create Queue
                db.get(`SELECT MAX(queue_number) as last_number FROM queues WHERE created_at >= ? AND created_at <= ?`,
                    [start, end],
                    (err, row) => {
                        if (err) {
                            console.error('[Walk-in] Error getting queue number:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }

                        const nextNumber = (row && row.last_number) ? row.last_number + 1 : 1;
                        console.log('[Walk-in] Next queue number:', nextNumber);

                        const queueQuery = `INSERT INTO queues (appointment_id, patient_name, queue_number, status) VALUES (?, ?, ?, 'waiting')`;
                        db.run(queueQuery, [appointmentId, patient_name, nextNumber], function (err) {
                            if (err) {
                                console.error('[Walk-in] Error creating queue:', err);
                                return res.status(500).json({ error: 'Gagal membuat antrean' });
                            }

                            console.log('[Walk-in] Success! Queue ID:', this.lastID, 'Number:', nextNumber);

                            // Log action
                            const logQuery = `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`;
                            db.run(logQuery, [req.user.id, 'ADD_QUEUE', `Added walk-in ${patient_name} to queue #${nextNumber}`, req.ip]);

                            res.status(201).json({
                                id: this.lastID,
                                queue_number: nextNumber,
                                appointment_id: appointmentId,
                                doctor_id: doctorId,
                                message: 'Berhasil mengambil nomor antrean'
                            });
                        });
                    });
            });
        });
    });
});

// Update queue status
router.put('/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body; // waiting, serving, completed, skipped
    const { id } = req.params;

    const query = `UPDATE queues SET status = ? WHERE id = ?`;
    db.run(query, [status, id], function (err) {
        if (err) {
            console.error('Error updating queue status:', err);
            return res.status(500).json({ error: 'Failed to update status' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Queue item not found' });
        }
        res.json({ message: 'Queue status updated' });
    });
});

// Delete from queue
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM queues WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Error deleting from queue:', err);
            return res.status(500).json({ error: 'Failed to delete from queue' });
        }
        res.json({ message: 'Removed from queue' });
    });
});

module.exports = router;
