import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, Save, ArrowLeft, User, Calendar, Stethoscope, Pill, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function PatientExamination() {
    const navigate = useNavigate()
    const location = useLocation()
    const { appointment, patient } = location.state || {}

    const [formData, setFormData] = useState({
        patient_id: patient?.patient_id || '',
        appointment_id: appointment?.appointment_id || '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        medications: []
    })
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [medicines, setMedicines] = useState([])
    const [newMedication, setNewMedication] = useState({
        medicine_id: '',
        name: '',
        unit: '',
        quantity: 1,
        dosage: '',
        frequency: '',
        duration: ''
    })
    const token = localStorage.getItem('token')

    // Fetch medicines for dropdown
    useEffect(() => {
        fetchMedicines()
    }, [])

    const fetchMedicines = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/medicines', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setMedicines(data)
            }
        } catch (error) {
            console.error('Error fetching medicines:', error)
        }
    }

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const addMedication = () => {
        if (!newMedication.medicine_id || !newMedication.quantity) {
            showToast('Obat dan jumlah harus diisi', 'error')
            return
        }

        // Check stock
        const medicine = medicines.find(m => m.id === parseInt(newMedication.medicine_id))
        if (medicine && medicine.stock < newMedication.quantity) {
            showToast(`Stock ${medicine.name} tidak mencukupi (tersedia: ${medicine.stock})`, 'error')
            return
        }

        setFormData({
            ...formData,
            medications: [...formData.medications, { ...newMedication, id: Date.now() }]
        })
        setNewMedication({ medicine_id: '', name: '', unit: '', quantity: 1, dosage: '', frequency: '', duration: '' })
    }

    const removeMedication = (id) => {
        setFormData({
            ...formData,
            medications: formData.medications.filter(med => med.id !== id)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.diagnosis.trim()) {
            showToast('Diagnosis harus diisi', 'error')
            return
        }

        setLoading(true)
        try {
            // Prepare treatment text with medications
            let treatmentText = formData.treatment
            if (formData.medications.length > 0) {
                treatmentText += '\n\nResep Obat:\n'
                formData.medications.forEach((med, idx) => {
                    treatmentText += `${idx + 1}. ${med.name} - ${med.dosage}${med.frequency ? ` - ${med.frequency}` : ''}${med.duration ? ` selama ${med.duration}` : ''}\n`
                })
            }

            // Create medical record
            const medicalRecordData = {
                patient_id: formData.patient_id,
                appointment_id: formData.appointment_id,
                diagnosis: formData.diagnosis,
                treatment: treatmentText,
                notes: formData.symptoms ? `Gejala: ${formData.symptoms}\n\n${formData.notes}` : formData.notes
            }

            const res = await fetch('http://localhost:3000/api/medical-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(medicalRecordData)
            })

            const data = await res.json()

            if (res.ok) {
                // If medications exist, create prescription
                if (formData.medications.length > 0) {
                    const prescriptionData = {
                        patient_id: formData.patient_id,
                        appointment_id: formData.appointment_id,
                        medications: formData.medications,
                        notes: `Diagnosis: ${formData.diagnosis}`
                    }

                    await fetch('http://localhost:3000/api/prescriptions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(prescriptionData)
                    })
                }

                showToast('✅ Rekam medis dan resep berhasil disimpan!', 'success')
                setTimeout(() => {
                    navigate('/doctor/medical-records')
                }, 1500)
            } else {
                showToast(data.error || 'Gagal menyimpan rekam medis', 'error')
            }
        } catch (error) {
            console.error('Error saving medical record:', error)
            showToast('Terjadi kesalahan saat menyimpan', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!appointment || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <FileText className="w-16 h-16 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-700">Data pasien tidak ditemukan</h2>
                <button
                    onClick={() => navigate('/doctor/queue')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                    Kembali ke Antrean
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header */}
            <ScrollReveal>
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Stethoscope className="w-96 h-96" />
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors relative z-10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali
                    </button>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <Stethoscope className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Pemeriksaan Pasien</h1>
                            <p className="text-primary-100 text-lg">Catat diagnosis dan resep obat untuk pasien</p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Patient Info Card */}
            <ScrollReveal delay={100}>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border-2 border-primary-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        Informasi Pasien
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Nama Pasien</p>
                            <p className="font-bold text-gray-800 text-lg">{patient.patient_name}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Nomor Antrean</p>
                            <p className="font-bold text-primary-600 text-lg">A-{String(appointment.queue_number).padStart(3, '0')}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Tanggal Pemeriksaan</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        {appointment.notes && appointment.notes !== 'Walk-in Queue' && (
                            <div className="md:col-span-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <p className="text-sm text-amber-700 font-semibold mb-1 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Keluhan Pasien
                                </p>
                                <p className="text-gray-700">{appointment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollReveal>

            {/* Examination Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Symptoms */}
                        <ScrollReveal delay={150}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Gejala & Keluhan
                                </label>
                                <textarea
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    placeholder="Catat gejala dan keluhan yang dialami pasien..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                />
                            </div>
                        </ScrollReveal>

                        {/* Diagnosis */}
                        <ScrollReveal delay={200}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-red-600" />
                                    </div>
                                    Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    placeholder="Masukkan diagnosis hasil pemeriksaan..."
                                    rows="5"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                                />
                            </div>
                        </ScrollReveal>

                        {/* Treatment Plan */}
                        <ScrollReveal delay={250}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    Rencana Tindakan
                                </label>
                                <textarea
                                    value={formData.treatment}
                                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    placeholder="Masukkan rencana tindakan medis dan anjuran untuk pasien..."
                                    rows="5"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                />
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right Column - Medications */}
                    <div className="space-y-6">
                        <ScrollReveal delay={300}>
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-violet-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-violet-100 rounded-lg">
                                        <Pill className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <span>Resep Obat</span>
                                </h3>

                                {/* Add Medication Form */}
                                <div className="bg-white rounded-xl p-4 mb-4 space-y-3 border border-violet-200">
                                    {/* Medicine Dropdown */}
                                    <select
                                        value={newMedication.medicine_id}
                                        onChange={(e) => {
                                            const selected = medicines.find(m => m.id === parseInt(e.target.value))
                                            setNewMedication({
                                                ...newMedication,
                                                medicine_id: e.target.value,
                                                name: selected?.name || '',
                                                unit: selected?.unit || ''
                                            })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm"
                                    >
                                        <option value="">-- Pilih Obat --</option>
                                        {medicines.map(med => (
                                            <option key={med.id} value={med.id}>
                                                {med.name} ({med.stock} {med.unit} tersedia)
                                            </option>
                                        ))}
                                    </select>

                                    {/* Quantity Input */}
                                    <div className="flex gap-2 items-center">
                                        <label className="text-sm font-medium text-gray-700 w-20">Jumlah:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Jumlah"
                                            value={newMedication.quantity}
                                            onChange={(e) => setNewMedication({ ...newMedication, quantity: parseInt(e.target.value) || 1 })}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm"
                                        />
                                        {newMedication.unit && (
                                            <span className="text-sm font-medium text-gray-600 min-w-[60px]">{newMedication.unit}</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Dosis (misal: 500mg)"
                                            value={newMedication.dosage}
                                            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Frekuensi (3x sehari)"
                                            value={newMedication.frequency}
                                            onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Durasi (misal: 7 hari)"
                                        value={newMedication.duration}
                                        onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addMedication}
                                        className="w-full py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Obat
                                    </button>
                                </div>

                                {/* Medications List */}
                                <div className="space-y-2">
                                    {formData.medications.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <Pill className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Belum ada obat ditambahkan</p>
                                        </div>
                                    ) : (
                                        formData.medications.map((med, idx) => (
                                            <div key={med.id} className="bg-white p-4 rounded-lg border border-violet-200 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded">#{idx + 1}</span>
                                                            <h4 className="font-bold text-gray-800">{med.name}</h4>
                                                        </div>
                                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                            <p><span className="font-semibold">Dosis:</span> {med.dosage}</p>
                                                            {med.frequency && <p><span className="font-semibold">Frekuensi:</span> {med.frequency}</p>}
                                                            {med.duration && <p><span className="font-semibold">Durasi:</span> {med.duration}</p>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedication(med.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Additional Notes */}
                        <ScrollReveal delay={350}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                    </div>
                                    Catatan Tambahan
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan medis tambahan, saran untuk pasien, dll..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Submit Buttons */}
                <ScrollReveal delay={400}>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-lg rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-200 hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6" />
                                    Simpan Rekam Medis & Resep
                                </>
                            )}
                        </button>
                    </div>
                </ScrollReveal>
            </form>
        </div>
    )
}
