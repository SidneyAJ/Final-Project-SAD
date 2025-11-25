const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, isPharmacist } = require('../middleware/auth');

// GET /api/medicines - Get all medicines (for dropdown)
router.get('/', authenticateToken, (req, res) => {
    const query = `
        SELECT id, name, description, stock, unit, price, category, minimum_stock
        FROM medicines
        WHERE stock > 0
        ORDER BY name ASC
    `;

    db.all(query, [], (err, medicines) => {
        if (err) {
            console.error('Error fetching medicines:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(medicines);
    });
});

// GET /api/medicines/all - Get all medicines including out of stock (for pharmacist)
router.get('/all', authenticateToken, isPharmacist, (req, res) => {
    const query = `
        SELECT id, name, description, stock, unit, price, category, minimum_stock,
               created_at, updated_at
        FROM medicines
        ORDER BY name ASC
    `;

    db.all(query, [], (err, medicines) => {
        if (err) {
            console.error('Error fetching all medicines:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(medicines);
    });
});

// GET /api/medicines/low-stock - Get medicines below minimum stock
router.get('/low-stock', authenticateToken, isPharmacist, (req, res) => {
    const query = `
        SELECT id, name, stock, unit, minimum_stock
        FROM medicines
        WHERE stock <= minimum_stock
        ORDER BY stock ASC
    `;

    db.all(query, [], (err, medicines) => {
        if (err) {
            console.error('Error fetching low stock medicines:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(medicines);
    });
});

// POST /api/medicines - Add new medicine (pharmacist only)
router.post('/', authenticateToken, isPharmacist, (req, res) => {
    const { name, description, stock, unit, price, minimum_stock, category } = req.body;

    if (!name || stock === undefined) {
        return res.status(400).json({ error: 'Name and stock are required' });
    }

    const query = `
        INSERT INTO medicines (name, description, stock, unit, price, minimum_stock, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, description || null, stock, unit || 'tablet', price || 0, minimum_stock || 10, category || null], function (err) {
        if (err) {
            console.error('Error adding medicine:', err);
            return res.status(500).json({ error: 'Failed to add medicine' });
        }

        // Log to stock history
        const historyQuery = `
            INSERT INTO stock_history (medicine_id, change_amount, reason, user_id)
            VALUES (?, ?, ?, ?)
        `;
        db.run(historyQuery, [this.lastID, stock, 'Initial stock', req.user.id]);

        res.status(201).json({
            id: this.lastID,
            message: 'Medicine added successfully'
        });
    });
});

// PUT /api/medicines/:id - Update medicine (pharmacist only)
router.put('/:id', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;
    const { name, description, stock, unit, price, minimum_stock, category } = req.body;

    // Get current stock first
    db.get('SELECT stock FROM medicines WHERE id = ?', [id], (err, current) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!current) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        const query = `
            UPDATE medicines
            SET name = ?, description = ?, stock = ?, unit = ?, price = ?, 
                minimum_stock = ?, category = ?
            WHERE id = ?
        `;

        db.run(query, [name, description, stock, unit, price, minimum_stock, category, id], function (err) {
            if (err) {
                console.error('Error updating medicine:', err);
                return res.status(500).json({ error: 'Failed to update medicine' });
            }

            // Log stock change if stock was updated
            if (stock !== current.stock) {
                const change = stock - current.stock;
                const historyQuery = `
                    INSERT INTO stock_history (medicine_id, change_amount, reason, user_id)
                    VALUES (?, ?, ?, ?)
                `;
                db.run(historyQuery, [id, change, 'Manual stock adjustment', req.user.id]);
            }

            res.json({ message: 'Medicine updated successfully' });
        });
    });
});

// DELETE /api/medicines/:id - Delete medicine (pharmacist only)
router.delete('/:id', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM medicines WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting medicine:', err);
            return res.status(500).json({ error: 'Failed to delete medicine' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        res.json({ message: 'Medicine deleted successfully' });
    });
});

// GET /api/medicines/:id/history - Get stock history for a medicine
router.get('/:id/history', authenticateToken, isPharmacist, (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT sh.*, u.name as user_name
        FROM stock_history sh
        LEFT JOIN users u ON sh.user_id = u.id
        WHERE sh.medicine_id = ?
        ORDER BY sh.created_at DESC
        LIMIT 50
    `;

    db.all(query, [id], (err, history) => {
        if (err) {
            console.error('Error fetching stock history:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(history);
    });
});

module.exports = router;
