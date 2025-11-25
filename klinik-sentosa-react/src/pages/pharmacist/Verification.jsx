import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Pill, User, Calendar, FileText, AlertTriangle } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function PharmacistVerification() {
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPendingPrescriptions()
    }, [])

    const fetchPendingPrescriptions = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/prescriptions/pending-verification', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setPrescriptions(data)
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
            setToast({ show: true, message: 'Gagal memuat data', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (prescriptionId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/prescriptions/${prescriptionId}/verify`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                setToast({ show: true, message: 'Resep berhasil diverifikasi!', type: 'success' })
                fetchPendingPrescriptions()
            } else {
                setToast({ show: true, message: 'Gagal memverifikasi resep', type: 'error' })
            }
        } catch (error) {
            console.error('Error verifying:', error)
            setToast({ show: true, message: 'Terjadi kesalahan', type: 'error' })
        }
    }

    const handleRejectClick = (prescription) => {
        setSelectedPrescription(prescription)
        setShowRejectModal(true)
    }

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            setToast({ show: true, message: 'Alasan penolakan harus diisi', type: 'error' })
            return
        }

        try {
            const res = await fetch(`http://localhost:3000/api/prescriptions/${selectedPrescription.id}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            })

            if (res.ok) {
                setToast({ show: true, message: 'Resep ditolak, dokter akan menerima notifikasi', type: 'success' })
                setShowRejectModal(false)
                setRejectionReason('')
                setSelectedPrescription(null)
                fetchPendingPrescriptions()
            } else {
                setToast({ show: true, message: 'Gagal menolak resep', type: 'error' })
            }
        } catch (error) {
            console.error('Error rejecting:', error)
            setToast({ show: true, message: 'Terjadi kesalahan', type: 'error' })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <ScrollReveal>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Resep</h1>
                    <p className="text-gray-600">Periksa dan verifikasi resep obat dari dokter</p>
                </div>
            </ScrollReveal>

            {prescriptions.length === 0 ? (
                <ScrollReveal delay={100}>
                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Semua Resep Terverifikasi</h3>
                        <p className="text-gray-500">Tidak ada resep yang menunggu verifikasi saat ini</p>
                    </div>
                </ScrollReveal>
            ) : (
                <div className="grid gap-6">
                    {prescriptions.map((prescription, index) => (
                        <ScrollReveal key={prescription.id} delay={index * 50}>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-5 h-5" />
                                                <span className="font-semibold">Pasien: {prescription.patient_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm opacity-90">
                                                <FileText className="w-4 h-4" />
                                                <span>Dokter: {prescription.doctor_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(prescription.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                                            Menunggu Verifikasi
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    {/* Diagnosis */}
                                    {prescription.diagnosis && (
                                        <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="font-bold text-gray-800 mb-2">Diagnosis:</h4>
                                            <p className="text-gray-700">{prescription.diagnosis}</p>
                                        </div>
                                    )}

                                    {/* Medications */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Pill className="w-5 h-5 text-emerald-500" />
                                            Daftar Obat
                                        </h4>
                                        <div className="space-y-3">
                                            {prescription.items && prescription.items.length > 0 ? (
                                                prescription.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                                            <Pill className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-gray-800">{item.medicine_name || item.name}</h5>
                                                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                                {item.quantity && (
                                                                    <div>Jumlah: <span className="font-medium text-gray-800">{item.quantity} {item.unit || 'unit'}</span></div>
                                                                )}
                                                                {item.dosage && (
                                                                    <div>Dosis: <span className="font-medium text-gray-800">{item.dosage}</span></div>
                                                                )}
                                                                {item.frequency && (
                                                                    <div>Frekuensi: <span className="font-medium text-gray-800">{item.frequency}</span></div>
                                                                )}
                                                                {item.duration && (
                                                                    <div>Durasi: <span className="font-medium text-gray-800">{item.duration}</span></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {item.stock !== undefined && (
                                                            <div className="text-right">
                                                                <div className="text-sm text-gray-500">Stock</div>
                                                                <div className={`font-bold ${item.stock < item.quantity ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                    {item.stock} {item.unit}
                                                                </div>
                                                                {item.stock < item.quantity && (
                                                                    <div className="text-xs text-red-500 mt-1">❌ Stock kurang</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">Tidak ada obat</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleRejectClick(prescription)}
                                            className="flex-1 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Tolak
                                        </button>
                                        <button
                                            onClick={() => handleVerify(prescription.id)}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Verifikasi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <ScrollReveal>
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Tolak Resep</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Berikan alasan penolakan resep untuk dokter:</p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Contoh: Stock Paracetamol habis, ganti dengan obat lain..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false)
                                        setRejectionReason('')
                                        setSelectedPrescription(null)
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleRejectSubmit}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Tolak Resep
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            )}
        </div>
    )
}
