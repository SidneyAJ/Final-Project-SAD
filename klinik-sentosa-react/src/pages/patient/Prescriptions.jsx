import { useState, useEffect } from 'react'
import { Pill, Calendar, User, FileText, DollarSign, CheckCircle, Clock, Package } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    const fetchPrescriptions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/prescriptions/my-prescriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPrescriptions(data)
            } else {
                setToast({ show: true, message: 'Gagal memuat data resep', type: 'error' })
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
            setToast({ show: true, message: 'Terjadi kesalahan saat memuat resep', type: 'error' })
        } finally {
            setLoading(false)
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
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Resep Obat Saya</h1>
                    <p className="text-gray-600">Lihat riwayat resep obat dan status pembayaran Anda</p>
                </div>
            </ScrollReveal>

            {prescriptions.length === 0 ? (
                <ScrollReveal delay={100}>
                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pill className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Resep</h3>
                        <p className="text-gray-500">Anda belum memiliki resep obat. Resep akan muncul setelah konsultasi dengan dokter.</p>
                    </div>
                </ScrollReveal>
            ) : (
                <div className="grid gap-6">
                    {prescriptions.map((prescription, index) => (
                        <ScrollReveal key={prescription.id} delay={index * 50}>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-5 h-5" />
                                                <span className="font-semibold text-sm opacity-90">Resep #{prescription.id}</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-1">{prescription.doctor_name || 'Dokter'}</h3>
                                            <div className="flex items-center gap-4 text-sm opacity-90">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(prescription.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${prescription.payment_status === 'paid'
                                                ? 'bg-green-400 text-green-900'
                                                : 'bg-yellow-400 text-yellow-900'
                                            }`}>
                                            {prescription.payment_status === 'paid' ? '✓ Lunas' : '○ Belum Bayar'}
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    {/* Medications */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-purple-500" />
                                            Daftar Obat
                                        </h4>
                                        <div className="space-y-3">
                                            {prescription.medications && prescription.medications.length > 0 ? (
                                                prescription.medications.map((med, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Pill className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-gray-800">{med.name}</h5>
                                                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                                <div>Dosis: <span className="font-medium text-gray-800">{med.dosage}</span></div>
                                                                <div>Frekuensi: <span className="font-medium text-gray-800">{med.frequency}</span></div>
                                                                <div>Durasi: <span className="font-medium text-gray-800">{med.duration}</span></div>
                                                            </div>
                                                        </div>
                                                        {med.price && (
                                                            <div className="text-right">
                                                                <div className="text-sm text-gray-500">Harga</div>
                                                                <div className="font-bold text-gray-800">Rp {parseInt(med.price).toLocaleString()}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">Tidak ada data obat</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {prescription.notes && (
                                        <div className="mb-6">
                                            <h4 className="font-bold text-gray-800 mb-2">Catatan Dokter</h4>
                                            <p className="text-gray-600 text-sm bg-blue-50 p-4 rounded-xl border border-blue-100">{prescription.notes}</p>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            {prescription.total_price ? (
                                                <>
                                                    <DollarSign className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <div className="text-xs text-gray-500">Total Biaya</div>
                                                        <div className="font-bold text-lg text-gray-800">Rp {parseInt(prescription.total_price).toLocaleString()}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-500">Harga belum ditentukan</span>
                                            )}
                                        </div>
                                        {prescription.payment_status === 'pending' && (
                                            <button
                                                onClick={() => setToast({ show: true, message: 'Fitur pembayaran online akan segera tersedia! Silakan bayar di kasir untuk saat ini.', type: 'info' })}
                                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                                            >
                                                <DollarSign className="w-5 h-5" />
                                                Bayar Sekarang
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    )
}
