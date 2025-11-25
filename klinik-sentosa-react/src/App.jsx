import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import PatientLayout from './layouts/PatientLayout'
import PatientDashboard from './pages/patient/PatientDashboard'
import Appointments from './pages/patient/Appointments'
import Queue from './pages/patient/Queue'
import MedicalRecords from './pages/patient/MedicalRecords'
import Prescriptions from './pages/patient/Prescriptions'
import Payments from './pages/patient/Payments'
import DoctorLayout from './layouts/DoctorLayout'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorQueue from './pages/doctor/DoctorQueue'
import DoctorRecords from './pages/doctor/DoctorRecords'
import DoctorPatients from './pages/doctor/DoctorPatients'
import PatientExamination from './pages/doctor/PatientExamination'
import DoctorMedicalRecords from './pages/doctor/MedicalRecords'
import NurseLayout from './layouts/NurseLayout'
import NurseDashboard from './pages/nurse/NurseDashboard'
import NurseQueue from './pages/nurse/NurseQueue'
import VitalSigns from './pages/nurse/VitalSigns'
import NursePatients from './pages/nurse/NursePatients'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import PatientRegistration from './pages/admin/PatientRegistration'
import PaymentCashier from './pages/admin/PaymentCashier'
import Reports from './pages/admin/Reports'
import AuditLogs from './pages/admin/AuditLogs'
import PharmacistLayout from './layouts/PharmacistLayout'
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard'
import PrescriptionQueue from './pages/pharmacist/PrescriptionQueue'
import MedicineInventory from './pages/pharmacist/MedicineInventory'
import PharmacistVerification from './pages/pharmacist/Verification'
import OwnerLayout from './layouts/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import FinancialReport from './pages/owner/FinancialReport'
import StaffActivity from './pages/owner/StaffActivity'
import ProfileSettings from './components/ProfileSettings'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute requiredRole="patient"><PatientLayout /></ProtectedRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="queue" element={<Queue />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Protected Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorLayout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="queue" element={<DoctorQueue />} />
            <Route path="records" element={<DoctorRecords />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="examination" element={<PatientExamination />} />
            <Route path="medical-records" element={<DoctorMedicalRecords />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Protected Nurse Routes */}
          <Route path="/nurse" element={<ProtectedRoute requiredRole="nurse"><NurseLayout /></ProtectedRoute>}>
            <Route index element={<NurseDashboard />} />
            <Route path="queue" element={<NurseQueue />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="patients" element={<PatientRegistration />} />
            <Route path="payments" element={<PaymentCashier />} />
            <Route path="reports" element={<Reports />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Protected Pharmacist Routes */}
          <Route path="/pharmacist" element={<ProtectedRoute requiredRole="pharmacist"><PharmacistLayout /></ProtectedRoute>}>
            <Route index element={<PharmacistDashboard />} />
            <Route path="verification" element={<PharmacistVerification />} />
            <Route path="prescriptions" element={<PrescriptionQueue />} />
            <Route path="inventory" element={<MedicineInventory />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Protected Owner Routes */}
          <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerLayout /></ProtectedRoute>}>
            <Route index element={<OwnerDashboard />} />
            <Route path="financial" element={<FinancialReport />} />
            <Route path="activity" element={<StaffActivity />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App

