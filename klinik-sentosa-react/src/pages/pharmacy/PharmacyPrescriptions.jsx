import { useState, useEffect } from 'react'
import { Pill, DollarSign, Check, X, Search, Eye } from 'lucide-react'
import Toast from '../../components/Toast'

export default function PharmacyPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [pricing, setPricing] = useState('')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPrescriptions()
    }, [filter])

    const fetchPrescriptions = async () => {
        try {
            const url = filter ? `http://localhost:3000/api/pharmacy/prescriptions?status=${filter}` : 'http://localhost:3000/api/pharmacy/prescriptions'
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Parse medications JSON
                const parsed = data.map(p => ({
                    ...p,
                    medications: typeof p.medications === 'string' ? JSON.parse(p.medications || '[]') : p.medications
                }))
                setPrescriptions(parsed)
            }
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error)
            setToast({ show: true, message: 'Gagal memuat data resep', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePrice = async (id) => {
        if (!pricing || pricing <= 0) {
            setToast({ show: true, message: 'Masukkan harga yang valid (lebih dari 0)', type: 'warning' })
            return
        }

        try {
            const res = await fetch(`http://localhost:3000/api/pharmacy/prescriptions/${id}/pricing`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ total_price: parseFloat(pricing) })
            })

            if (res.ok) {
                setToast({ show: true, message: 'Harga berhasil diupdate!', type: 'success' })
                setPricing('')
                setSelectedPrescription(null)
                fetchPrescriptions()
            }
        } catch (error) {
            console.error('Failed to update price:', error)
            setToast({ show: true, message: 'Gagal mengupdate harga', type: 'error' })
        }
    }

    const handleComplete = async (id) => {
        if (!confirm('Tandai resep sebagai selesai dan kirim ke pasien?')) return

        try {
            const res = await fetch(`http://localhost:3000/api/pharmacy/prescriptions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            })

            if (res.ok) {
                setToast({ show: true, message: 'Resep selesai diproses dan dikirim ke pasien!', type: 'success' })
                fetchPrescriptions()
            }
        } catch (error) {
            console.error('Failed to complete:', error)
            setToast({ show: true, message: 'Gagal menyelesaikan resep', type: 'error' })
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return badges[status] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
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

            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Resep</h1>
                <p className="text-gray-600">Proses resep dari dokter dan tentukan harga</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'verified' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
                {prescriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada resep</h3>
                        <p className="text-gray-600">Resep dengan status {filter} akan muncul di sini</p>
                    </div>
                ) : (
                    prescriptions.map((prescription) => (
                        <div key={prescription.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Resep #{prescription.id}</h3>
                                    <p className="text-sm text-gray-600">Pasien: {prescription.patient_name}</p>
                                    <p className="text-sm text-gray-600">Dokter: {prescription.doctor_name}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(prescription.status)}`}>
                                    {prescription.status}
                                </span>
                            </div>

                            {/* Medications */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-gray-800 mb-2">Daftar Obat:</h4>
                                {prescription.medications && prescription.medications.length > 0 ? (
                                    <ul className="space-y-2">
                                        {prescription.medications.map((med, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">
                                                <strong>{med.name}</strong> - {med.dosage} • {med.frequency} • {med.duration}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">Tidak ada obat</p>
                                )}
                            </div>

                            {/* Pricing Section */}
                            {prescription.status === 'pending' && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <DollarSign className="w-4 h-4 inline mr-1" />
                                        Tentukan Harga Total
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            placeholder="Harga dalam Rupiah"
                                            value={selectedPrescription === prescription.id ? pricing : ''}
                                            onFocus={() => setSelectedPrescription(prescription.id)}
                                            onChange={(e) => setPricing(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                        <button
                                            onClick={() => handleUpdatePrice(prescription.id)}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Set Harga
                                        </button>
                                    </div>
                                </div>
                            )}

                            {prescription.status === 'verified' && (
                                <div className="flex items-center justify-between bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Harga Total:</p>
                                        <p className="text-2xl font-bold text-green-600">Rp {prescription.total_price?.toLocaleString('id-ID')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleComplete(prescription.id)}
                                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-bold flex items-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        Selesai & Kirim
                                    </button>
                                </div>
                            )}

                            {prescription.status === 'completed' && prescription.total_price && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-gray-700">Harga Total:</p>
                                    <p className="text-xl font-bold text-gray-800">Rp {prescription.total_price.toLocaleString('id-ID')}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
