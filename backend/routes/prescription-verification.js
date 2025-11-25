const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, isPharmacist } = require('../middleware/auth');

// GET /api/prescriptions/pending-verification - Get all prescriptions pending pharmacist verification
router.get('/pending-verification', authenticateToken, isPharmacist, (req, res) => {
    const query = `
        SELECT p.*, 
               pat.name as patient_name,
               d.full_name as doctor_name,
               mr.diagnosis
        FROM prescriptions p
        JOIN patients pat ON p.patient_id = pat.id
        LEFT JOIN users du ON pat.user_id = du.id
        LEFT JOIN doctors d ON p.doctor_id = d.id
        LEFT JOIN medical_records mr ON p.appointment_id = mr.appointment_id
        WHERE p.verification_status = 'pending'
        ORDER BY p.created_at DESC
    `;

    db.all(query, [], (err, prescriptions) => {
        if (err) {
            console.error('Error fetching pending prescriptions:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Fetch prescription items for each prescription
        const prescriptionPromises = prescriptions.map(prescription => {
            return new Promise((resolve, reject) => {
                const itemsQuery = `
                    SELECT pi.*, m.name as medicine_name, m.unit, m.stock
                    FROM prescription_items pi
                    LEFT JOIN medicines m ON pi.medicine_id = m.id
                    WHERE pi.prescription_id = ?
                `;

                db.all(itemsQuery, [prescription.id], (err, items) => {
                    if (err) return reject(err);
                    prescription.items = items;
                    resolve(prescription);
                });
            });
        });

        Promise.all(prescriptionPromises)
            .then(result => res.json(result))
            .catch(err => {
                console.error('Error fetching prescription items:', err);
                res.status(500).json({ error: 'Database error' });
            });
    });
});

// PUT /api/prescriptions/:id/verify - Verify prescription (approve)
router.put('/:id/verify', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE prescriptions
        SET verification_status = 'verified',
            verified_by = ?,
            verified_at = CURRENT_TIMESTAMP,
            rejection_reason = NULL
        WHERE id = ?
    `;

    db.run(query, [req.user.id, id], function (err) {
        if (err) {
            console.error('Error verifying prescription:', err);
            return res.status(500).json({ error: 'Failed to verify prescription' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.json({ message: 'Prescription verified successfully' });
    });
});

// PUT /api/prescriptions/:id/reject - Reject prescription
router.put('/:id/reject', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
        return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const query = `
        UPDATE prescriptions
        SET verification_status = 'rejected',
            verified_by = ?,
            verified_at = CURRENT_TIMESTAMP,
            rejection_reason = ?
        WHERE id = ?
    `;

    db.run(query, [req.user.id, reason, id], function (err) {
        if (err) {
            console.error('Error rejecting prescription:', err);
            return res.status(500).json({ error: 'Failed to reject prescription' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        res.json({ message: 'Prescription rejected successfully' });
    });
});

// PUT /api/prescriptions/:id/dispense - Mark prescription as dispensed and deduct stock
router.put('/:id/dispense', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;

    // First, check if prescription is verified
    db.get('SELECT * FROM prescriptions WHERE id = ?', [id], (err, prescription) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        if (prescription.verification_status !== 'verified') {
            return res.status(400).json({ error: 'Prescription must be verified before dispensing' });
        }

        if (prescription.dispensed) {
            return res.status(400).json({ error: 'Prescription already dispensed' });
        }

        // Get prescription items
        const itemsQuery = 'SELECT * FROM prescription_items WHERE prescription_id = ?';

        db.all(itemsQuery, [id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Check stock availability for all items
            let stockErrors = [];
            const stockChecks = items.map(item => {
                return new Promise((resolve, reject) => {
                    if (!item.medicine_id) {
                        return resolve(); // Skip items without medicine_id
                    }

                    db.get('SELECT * FROM medicines WHERE id = ?', [item.medicine_id], (err, medicine) => {
                        if (err) return reject(err);

                        if (!medicine) {
                            stockErrors.push(`Medicine ID ${item.medicine_id} not found`);
                        } else if (medicine.stock < item.quantity) {
                            stockErrors.push(`${medicine.name}: stock insufficient (available: ${medicine.stock}, needed: ${item.quantity})`);
                        }

                        resolve();
                    });
                });
            });

            Promise.all(stockChecks)
                .then(() => {
                    if (stockErrors.length > 0) {
                        return res.status(400).json({
                            error: 'Stock insufficient',
                            details: stockErrors
                        });
                    }

                    // Deduct stock for each item
                    const deductPromises = items.map(item => {
                        return new Promise((resolve, reject) => {
                            if (!item.medicine_id) {
                                return resolve();
                            }

                            const deductQuery = `
                                UPDATE medicines 
                                SET stock = stock - ?
                                WHERE id = ?
                            `;

                            db.run(deductQuery, [item.quantity, item.medicine_id], function (err) {
                                if (err) return reject(err);

                                // Log to stock history
                                const historyQuery = `
                                    INSERT INTO stock_history 
                                    (medicine_id, change_amount, reason, user_id, prescription_id)
                                    VALUES (?, ?, ?, ?, ?)
                                `;

                                db.run(historyQuery, [
                                    item.medicine_id,
                                    -item.quantity,
                                    'Dispensed to patient',
                                    req.user.id,
                                    id
                                ], (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                });
                            });
                        });
                    });

                    return Promise.all(deductPromises);
                })
                .then(() => {
                    // Mark prescription as dispensed
                    const updateQuery = `
                        UPDATE prescriptions
                        SET dispensed = TRUE,
                            dispensed_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;

                    db.run(updateQuery, [id], function (err) {
                        if (err) {
                            console.error('Error marking prescription as dispensed:', err);
                            return res.status(500).json({ error: 'Failed to mark as dispensed' });
                        }

                        res.json({ message: 'Prescription dispensed successfully, stock updated' });
                    });
                })
                .catch(err => {
                    console.error('Error deducting stock:', err);
                    res.status(500).json({ error: 'Failed to deduct stock' });
                });
        });
    });
});

// GET /api/prescriptions/verified - Get verified prescriptions (for patient view)
router.get('/verified', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, 
               d.full_name as doctor_name,
               pat.name as patient_name
        FROM prescriptions p
        LEFT JOIN doctors d ON p.doctor_id = d.id
        LEFT JOIN patients pat ON p.patient_id = pat.id
        LEFT JOIN users u ON pat.user_id = u.id
        WHERE p.verification_status = 'verified'
        AND u.id = ?
        ORDER BY p.created_at DESC
    `;

    db.all(query, [req.user.id], (err, prescriptions) => {
        if (err) {
            console.error('Error fetching verified prescriptions:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Fetch items for each prescription
        const promises = prescriptions.map(p => {
            return new Promise((resolve, reject) => {
                db.all(
                    'SELECT pi.*, m.name as medicine_name, m.unit FROM prescription_items pi LEFT JOIN medicines m ON pi.medicine_id = m.id WHERE pi.prescription_id = ?',
                    [p.id],
                    (err, items) => {
                        if (err) return reject(err);
                        p.items = items;
                        resolve(p);
                    }
                );
            });
        });

        Promise.all(promises)
            .then(result => res.json(result))
            .catch(err => {
                console.error('Error fetching prescription items:', err);
                res.status(500).json({ error: 'Database error' });
            });
    });
});

module.exports = router;
