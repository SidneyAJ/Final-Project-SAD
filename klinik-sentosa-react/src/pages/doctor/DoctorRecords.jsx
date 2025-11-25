import { useState, useEffect } from 'react'
import { FileText, User, Calendar, Search, Eye, Filter, TrendingUp, Activity, Plus } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CreateMedicalRecord from './CreateMedicalRecord'

export default function DoctorRecords() {
    const [records, setRecords] = useState([])
    const [filteredRecords, setFilteredRecords] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        patientId: '',
        dateFrom: '',
        dateTo: '',
        diagnosis: ''
    })
    const [showCreateForm, setShowCreateForm] = useState(false)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchRecords()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [records, searchQuery, filters])

    const fetchRecords = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/medical-records', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setRecords(data)
            }
        } catch (error) {
            console.error('Failed to fetch records:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRecordDetail = async (recordId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/doctors/medical-records/${recordId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSelectedRecord(data)
            }
        } catch (error) {
            console.error('Failed to fetch record detail:', error)
        }
    }

    const applyFilters = () => {
        let filtered = records

        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredRecords(filtered)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Rekam Medis</h1>
                            <p className="text-gray-600">Lihat dan kelola rekam medis pasien</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Buat Rekam Medis Baru
                        </button>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="up" delay={50}>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="text-3xl font-bold text-gray-800">{records.length}</div>
                    <div className="text-sm text-gray-600">Total Rekam Medis</div>
                </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama pasien atau diagnosis..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
            </ScrollReveal>

            {/* Records List */}
            <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada rekam medis</h3>
                        <p className="text-gray-600">Rekam medis akan muncul di sini setelah Anda membuatnya</p>
                    </div>
                ) : (
                    filteredRecords.map((record, idx) => (
                        <ScrollReveal key={record.id} direction="up" delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{record.diagnosis}</h3>
                                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {record.patient_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(record.created_at)}
                                                </span>
                                                {record.appointment_date && (
                                                    <span className="text-xs text-gray-500">
                                                        Appointment: {formatDate(record.appointment_date)}
                                                    </span>
                                                )}
                                            </div>
                                            {record.treatment && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Pengobatan:</strong> {record.treatment}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => fetchRecordDetail(record.id)}
                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all font-medium flex items-center gap-2"
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

            {/* Record Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecord(null)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedRecord.diagnosis}</h2>
                                    <p className="text-gray-600">{selectedRecord.patient_name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Patient Info */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Pasien</h3>
                                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nama:</span>
                                        <span className="font-semibold text-gray-800 ml-2">{selectedRecord.patient_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">NIK:</span>
                                        <span className="font-semibold text-gray-800 ml-2">{selectedRecord.nik}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Telepon:</span>
                                        <span className="font-semibold text-gray-800 ml-2">{selectedRecord.phone}</span>
                                    </div>
                                    {selectedRecord.date_of_birth && (
                                        <div>
                                            <span className="text-gray-600">Tanggal Lahir:</span>
                                            <span className="font-semibold text-gray-800 ml-2">
                                                {formatDate(selectedRecord.date_of_birth)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedRecord.gender && (
                                        <div>
                                            <span className="text-gray-600">Jenis Kelamin:</span>
                                            <span className="font-semibold text-gray-800 ml-2">
                                                {selectedRecord.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600">Tanggal Pemeriksaan:</span>
                                        <span className="font-semibold text-gray-800 ml-2">
                                            {formatDate(selectedRecord.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Diagnosis</h3>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-gray-800 font-semibold">{selectedRecord.diagnosis}</p>
                                </div>
                            </div>

                            {/* Symptoms */}
                            {selectedRecord.symptoms && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Gejala</h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700">{selectedRecord.symptoms}</p>
                                    </div>
                                </div>
                            )}

                            {/* Treatment */}
                            {selectedRecord.treatment && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Pengobatan</h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700">{selectedRecord.treatment}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedRecord.notes && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Catatan Dokter</h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-gray-700">{selectedRecord.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Medical Record Modal */}
            {showCreateForm && (
                <CreateMedicalRecord
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        fetchRecords()
                        setShowCreateForm(false)
                    }}
                />
            )}
        </div>
    )
}
