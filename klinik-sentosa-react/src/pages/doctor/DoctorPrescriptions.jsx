import { useState, useEffect } from 'react'
import { Pill, User, Calendar, Search, Eye, Package, Activity } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function DoctorPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([])
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // all, active, completed
    const [selectedPrescription, setSelectedPrescription] = useState(null)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [prescriptions, searchQuery, statusFilter])

    const fetchPrescriptions = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/prescriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setPrescriptions(data)
            }
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = prescriptions

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.medications?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredPrescriptions(filtered)
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aktif' },
            completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' }
        }
        const badge = badges[status] || badges.active
        return (
            <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-lg text-sm font-semibold`}>
                {badge.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Resep</h1>
                    <p className="text-gray-600">Lihat dan kelola resep obat pasien</p>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="up" delay={50}>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="text-2xl font-bold text-gray-800">{prescriptions.length}</div>
                        <div className="text-sm text-gray-600">Total Resep</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-100">
                        <div className="text-2xl font-bold text-green-700">
                            {prescriptions.filter(p => p.status === 'active').length}
                        </div>
                        <div className="text-sm text-green-600">Aktif</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="text-2xl font-bold text-gray-700">
                            {prescriptions.filter(p => p.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Selesai</div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Search & Filter */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama pasien atau obat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['all', 'active', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-3 rounded-xl font-medium transition-all ${statusFilter === status
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Selesai'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Prescriptions List */}
            <div className="space-y-4">
                {filteredPrescriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada resep</h3>
                        <p className="text-gray-600">Resep akan muncul di sini setelah Anda membuatnya</p>
                    </div>
                ) : (
                    filteredPrescriptions.map((prescription, idx) => (
                        <ScrollReveal key={prescription.id} direction="up" delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                                            <Pill className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{prescription.patient_name}</h3>
                                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(prescription.created_at)}
                                                </span>
                                                {prescription.diagnosis && (
                                                    <span className="text-xs text-gray-500">
                                                        Diagnosis: {prescription.diagnosis}
                                                    </span>
                                                )}
                                            </div>
                                            {prescription.medications && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                                    <strong>Obat:</strong> {prescription.medications}
                                                </p>
                                            )}
                                            <div className="mt-2">
                                                {getStatusBadge(prescription.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedPrescription(prescription)}
                                        className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all font-medium flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>

            {/* Prescription Detail Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPrescription(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Resep Obat</h2>
                                    <p className="text-gray-600">{selectedPrescription.patient_name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPrescription(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi</h3>
                                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Pasien:</span>
                                        <span className="font-semibold text-gray-800 ml-2">{selectedPrescription.patient_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Telepon:</span>
                                        <span className="font-semibold text-gray-800 ml-2">{selectedPrescription.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Tanggal:</span>
                                        <span className="font-semibold text-gray-800 ml-2">
                                            {formatDate(selectedPrescription.created_at)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className="ml-2">{getStatusBadge(selectedPrescription.status)}</span>
                                    </div>
                                    {selectedPrescription.diagnosis && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Diagnosis:</span>
                                            <span className="font-semibold text-gray-800 ml-2">{selectedPrescription.diagnosis}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medications */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Daftar Obat
                                </h3>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <p className="text-gray-800 whitespace-pre-wrap">{selectedPrescription.medications}</p>
                                </div>
                            </div>

                            {/* Instructions */}
                            {selectedPrescription.notes && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Instruksi Tambahan</h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700">{selectedPrescription.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
