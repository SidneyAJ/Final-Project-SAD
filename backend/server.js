const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Root route
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const pharmacyRoutes = require('./routes/pharmacy');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const medicinesRoutes = require('./routes/medicines');
const prescriptionVerificationRoutes = require('./routes/prescription-verification');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/prescriptions', prescriptionVerificationRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/medical-records', require('./routes/medical-records'));

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
