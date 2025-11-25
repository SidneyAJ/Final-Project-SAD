import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle, Clock, User, Stethoscope, ArrowRight } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function PrescriptionQueue() {
    const [prescriptions, setPrescriptions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    const fetchPrescriptions = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/pharmacy/prescriptions?status=pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPrescriptions(data)
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
            setToast({ show: true, message: 'Gagal memuat antrean resep', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleProcess = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/api/pharmacy/prescriptions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (response.ok) {
                setToast({ show: true, message: `Resep berhasil diproses: ${status === 'verified' ? 'Terverifikasi' : 'Selesai'}`, type: 'success' })
                fetchPrescriptions()
                setSelectedPrescription(null)
            }
        } catch (error) {
            console.error('Error processing prescription:', error)
            setToast({ show: true, message: 'Gagal memproses resep', type: 'error' })
        }
    }

    const fetchDetails = async (id) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/api/pharmacy/prescriptions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setSelectedPrescription(data)
            }
        } catch (error) {
            console.error('Error fetching details:', error)
            setToast({ show: true, message: 'Gagal memuat detail resep', type: 'error' })
        }
    }

    return (
        <div className="space-y-6 relative">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Antrean Resep</h1>
                    <p className="text-slate-600">Verifikasi dan siapkan obat untuk pasien</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-1 space-y-4">
                    {prescriptions.length === 0 && !isLoading ? (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                            Tidak ada resep menunggu
                        </div>
                    ) : (
                        prescriptions.map((p) => (
                            <ScrollReveal key={p.id} direction="right">
                                <div
                                    onClick={() => fetchDetails(p.id)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedPrescription?.id === p.id
                                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                                        : 'bg-white border-slate-200 hover:border-emerald-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                                            Menunggu
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{p.patient_name}</h3>
                                    <p className="text-sm text-slate-500 mb-2">{p.nik}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Stethoscope className="w-3 h-3" />
                                        {p.doctor_name}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))
                    )}
                </div>

                {/* Details */}
                <div className="lg:col-span-2">
                    {selectedPrescription ? (
                        <ScrollReveal direction="up">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedPrescription.patient_name}</h2>
                                        <p className="text-slate-500 flex items-center gap-2">
                                            <User className="w-4 h-4" /> {selectedPrescription.nik}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">Dokter Peresep</p>
                                        <p className="font-bold text-slate-700">{selectedPrescription.doctor_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-emerald-500" />
                                        Daftar Obat
                                    </h3>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        {selectedPrescription.items && selectedPrescription.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.medicine_name}</p>
                                                    <p className="text-sm text-slate-500">{item.dosage} - {item.instructions}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-emerald-600">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedPrescription.notes && (
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
                                            <strong>Catatan Dokter:</strong> {selectedPrescription.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleProcess(selectedPrescription.id, 'verified')}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Verifikasi & Siapkan
                                    </button>
                                    <button
                                        onClick={() => handleProcess(selectedPrescription.id, 'completed')}
                                        className="flex-1 py-3 bg-white border-2 border-emerald-600 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                        Selesai & Serahkan
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                            <div className="text-center text-slate-400">
                                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Pilih resep dari antrean untuk memproses</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
