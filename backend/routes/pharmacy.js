const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Middleware
const requirePharmacist = [authenticateToken, authorizeRole('pharmacist')];
const requirePharmacistOrOwner = [authenticateToken, authorizeRole(['pharmacist', 'owner'])];

// --- MEDICINES (INVENTORY) ---

// GET /medicines - List all medicines
router.get('/medicines', authenticateToken, (req, res) => {
    const query = "SELECT * FROM medicines ORDER BY name ASC";
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// POST /medicines - Add new medicine (Pharmacist only)
router.post('/medicines', requirePharmacist, (req, res) => {
    const { name, category, stock, unit, price, expiry_date } = req.body;

    if (!name || !price) return res.status(400).json({ error: 'Name and Price are required' });

    const query = `
        INSERT INTO medicines (name, category, stock, unit, price, expiry_date) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, category, stock || 0, unit, price, expiry_date], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'Medicine added successfully', id: this.lastID });
    });
});

// PUT /medicines/:id - Update medicine (Pharmacist only)
router.put('/medicines/:id', requirePharmacist, (req, res) => {
    const { name, category, stock, unit, price, expiry_date } = req.body;
    const id = req.params.id;

    const query = `
        UPDATE medicines 
        SET name=?, category=?, stock=?, unit=?, price=?, expiry_date=?
        WHERE id=?
    `;

    db.run(query, [name, category, stock, unit, price, expiry_date, id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Medicine not found' });
        res.json({ message: 'Medicine updated successfully' });
    });
});

// PUT /medicines/:id/stock - Quick stock update (Restock)
router.put('/medicines/:id/stock', requirePharmacist, (req, res) => {
    const { quantity, type } = req.body; // type: 'add' or 'subtract'
    const id = req.params.id;

    if (!quantity || !type) return res.status(400).json({ error: 'Quantity and type required' });

    const operator = type === 'add' ? '+' : '-';
    const query = `UPDATE medicines SET stock = stock ${operator} ? WHERE id = ?`;

    db.run(query, [quantity, id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Stock updated successfully' });
    });
});

// --- PRESCRIPTIONS ---

// GET /prescriptions - List prescriptions (Filtered by Role)
router.get('/prescriptions', authenticateToken, (req, res) => {
    const status = req.query.status; // pending, verified, completed
    let query = `
        SELECT p.*, pat.name as patient_name, pat.nik, d.name as doctor_name 
        FROM prescriptions p
        JOIN patients pt ON p.patient_id = pt.id
        JOIN users pat ON pt.user_id = pat.id
        JOIN doctors doc ON p.doctor_id = doc.id
        JOIN users d ON doc.user_id = d.id
    `;

    const params = [];
    const conditions = [];

    if (status) {
        conditions.push("p.status = ?");
        params.push(status);
    }

    // Data Isolation: Patients can only see their own prescriptions
    if (req.user.role === 'patient') {
        conditions.push("pt.user_id = ?");
        params.push(req.user.id);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY p.created_at ASC";

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// GET /prescriptions/:id - Get details with items
router.get('/prescriptions/:id', authenticateToken, (req, res) => {
    const id = req.params.id;

    const queryPrescription = `
        SELECT p.*, pat.name as patient_name, pat.nik, d.name as doctor_name 
        FROM prescriptions p
        JOIN patients pt ON p.patient_id = pt.id
        JOIN users pat ON pt.user_id = pat.id
        JOIN doctors doc ON p.doctor_id = doc.id
        JOIN users d ON doc.user_id = d.id
        WHERE p.id = ?
    `;

    db.get(queryPrescription, [id], (err, prescription) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

        const queryItems = "SELECT * FROM prescription_items WHERE prescription_id = ?";
        db.all(queryItems, [id], (err, items) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ ...prescription, items });
        });
    });
});

// PUT /prescriptions/:id/status - Update status (Verify/Complete)
router.put('/prescriptions/:id/status', requirePharmacist, (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    if (!['pending', 'verified', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    // If completing, we should ideally deduct stock here, but for simplicity we'll do it in a separate transaction or assume it's done manually via stock update for now.
    // Advanced: Transaction to deduct stock.

    const query = "UPDATE prescriptions SET status = ? WHERE id = ?";
    db.run(query, [status, id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        // AUTOMATIC BILLING TRIGGER: Medication Fee
        if (status === 'completed') {
            // Calculate total price from items
            const priceQuery = `
                SELECT SUM(m.price * pi.quantity) as total
                FROM prescription_items pi
                JOIN medicines m ON pi.medicine_id = m.id
                WHERE pi.prescription_id = ?
            `;

            db.get(priceQuery, [id], (err, row) => {
                if (!err && row && row.total > 0) {
                    // Get patient_id from prescription
                    db.get("SELECT patient_id FROM prescriptions WHERE id = ?", [id], (err, pres) => {
                        if (!err && pres) {
                            const billQuery = "INSERT INTO payments (patient_id, amount, description, status) VALUES (?, ?, ?, 'pending')";
                            db.run(billQuery, [pres.patient_id, row.total, `Biaya Obat (Resep #${id})`, 'pending']);
                        }
                    });
                }
            });
        }

        res.json({ message: `Prescription marked as ${status}` });
    });
});

// PUT /prescriptions/:id/pricing - Update prescription pricing (Pharmacist)
router.put('/prescriptions/:id/pricing', requirePharmacist, (req, res) => {
    const { total_price } = req.body;
    const id = req.params.id;

    if (!total_price || total_price < 0) {
        return res.status(400).json({ error: 'Valid total_price required' });
    }

    const query = `
        UPDATE prescriptions 
        SET total_price = ?, 
            processed_by = ?, 
            processed_at = NOW(),
            status = 'verified'
        WHERE id = ?
    `;

    db.run(query, [total_price, req.user.id, id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json({
            message: 'Harga resep berhasil diupdate',
            total_price,
            status: 'verified'
        });
    });
});

module.exports = router;
