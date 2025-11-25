import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, User, FileText, Pill } from 'lucide-react'
import Toast from '../../components/Toast'

export default function CreateMedicalRecord({ onClose, onSuccess }) {
    const [completedPatients, setCompletedPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        appointment_id: '',
        patient_id: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: ''
    })
    const [medications, setMedications] = useState([])
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
    })
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchCompletedPatients()
    }, [])

    const fetchCompletedPatients = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/completed-patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCompletedPatients(data)
            }
        } catch (error) {
            console.error('Failed to fetch completed patients:', error)
            setToast({ show: true, message: 'Gagal memuat data pasien', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handlePatientSelect = (e) => {
        const appointmentId = e.target.value
        const selected = completedPatients.find(p => p.appointment_id === parseInt(appointmentId))
        if (selected) {
            setFormData({
                ...formData,
                appointment_id: selected.appointment_id,
                patient_id: selected.patient_id
            })
        }
    }

    const addMedication = () => {
        if (newMed.name && newMed.dosage) {
            setMedications([...medications, { ...newMed }])
            setNewMed({ name: '', dosage: '', frequency: '', duration: '' })
        }
    }

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.appointment_id || !formData.diagnosis) {
            setToast({ show: true, message: 'Pilih pasien dan isi diagnosis', type: 'warning' })
            return
        }

        setSubmitting(true)
        try {
            // 1. Create medical record
            const mrRes = await fetch('http://localhost:3000/api/medical-records', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!mrRes.ok) throw new Error('Failed to create medical record')
            const mrData = await mrRes.json()

            // 2. Create prescription if medications exist
            if (medications.length > 0) {
                await fetch('http://localhost:3000/api/prescriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        patient_id: formData.patient_id,
                        appointment_id: formData.appointment_id,
                        medications,
                        notes: formData.notes
                    })
                })
            }

            setToast({ show: true, message: 'Rekam medis berhasil dibuat!', type: 'success' })
            setTimeout(() => {
                onSuccess()
                onClose()
            }, 1500)
        } catch (error) {
            console.error('Failed to create medical record:', error)
            setToast({ show: true, message: 'Gagal membuat rekam medis', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Buat Rekam Medis Baru</h2>
                        <p className="text-gray-600">Pilih pasien dan isi data pemeriksaan</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Pilih Pasien *
                        </label>
                        {loading ? (
                            <div className="text-gray-500">Loading...</div>
                        ) : completedPatients.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                                Tidak ada pasien yang sudah selesai diperiksa. Panggil pasien dari antrean terlebih dahulu.
                            </div>
                        ) : (
                            <select
                                required
                                value={formData.appointment_id}
                                onChange={handlePatientSelect}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            >
                                <option value="">-- Pilih Pasien --</option>
                                {completedPatients.map(patient => (
                                    <option key={patient.appointment_id} value={patient.appointment_id}>
                                        {patient.patient_name} - {patient.appointment_date} - No. Antrean: {patient.queue_number || '-'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Symptoms */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gejala</label>
                        <textarea
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            rows="3"
                            placeholder="Keluhan pasien..."
                        />
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Diagnosis *
                        </label>
                        <textarea
                            required
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            rows="3"
                            placeholder="Diagnosis penyakit..."
                        />
                    </div>

                    {/* Treatment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rencana Pengobatan</label>
                        <textarea
                            value={formData.treatment}
                            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            rows="3"
                            placeholder="Tindakan dan pengobatan yang diberikan..."
                        />
                    </div>

                    {/* Medications */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <Pill className="w-4 h-4 inline mr-1" />
                            Daftar Obat
                        </label>

                        {/* Medication List */}
                        {medications.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {medications.map((med, idx) => (
                                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800">{med.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {med.dosage} • {med.frequency} • {med.duration}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(idx)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Medication Form */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Nama Obat"
                                value={newMed.name}
                                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Dosis (ex: 500mg)"
                                value={newMed.dosage}
                                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Frekuensi (ex: 3x sehari)"
                                value={newMed.frequency}
                                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Durasi (ex: 7 hari)"
                                value={newMed.duration}
                                onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addMedication}
                            disabled={!newMed.name || !newMed.dosage}
                            className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Obat
                        </button>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Tambahan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            rows="2"
                            placeholder="Catatan dokter..."
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !formData.appointment_id}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
