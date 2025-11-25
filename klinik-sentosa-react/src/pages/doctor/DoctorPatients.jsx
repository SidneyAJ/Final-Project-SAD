import { useState, useEffect } from 'react'
import { Users, Search, Eye, FileText, Calendar, Activity, Pill, ChevronRight } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function DoctorPatients() {
    const [patients, setPatients] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [patientHistory, setPatientHistory] = useState(null)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setPatients(data)
            }
        } catch (error) {
            console.error('Failed to fetch patients:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPatientHistory = async (patientId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/doctors/patients/${patientId}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setPatientHistory(data)
            }
        } catch (error) {
            console.error('Failed to fetch patient history:', error)
        }
    }

    const handleViewHistory = (patient) => {
        setSelectedPatient(patient)
        fetchPatientHistory(patient.patient_id)
    }

    const filteredPatients = patients.filter(p =>
        p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nik?.includes(searchQuery)
    )

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Daftar Pasien</h1>
                    <p className="text-gray-600">Lihat riwayat pasien yang pernah Anda tangani</p>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="up" delay={50}>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="text-3xl font-bold text-gray-800">{patients.length}</div>
                    <div className="text-sm text-gray-600">Total Pasien Terdaftar</div>
                </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau NIK..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                    </div>
                </div>
            </ScrollReveal>

            {/* Patient List */}
            <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada pasien</h3>
                        <p className="text-gray-600">Pasien akan muncul setelah Anda membuat rekam medis</p>
                    </div>
                ) : (
                    filteredPatients.map((patient, idx) => (
                        <ScrollReveal key={patient.patient_id} direction="up" delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {patient.patient_name?.charAt(0) || 'P'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{patient.patient_name}</h3>
                                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                <span>NIK: {patient.nik}</span>
                                                <span>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                <span>{patient.phone}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Kunjungan terakhir: {formatDate(patient.last_visit)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {patient.total_visits} kunjungan
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewHistory(patient)}
                                        className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all font-medium flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat Riwayat
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>

            {/* Patient History Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.patient_name}</h2>
                                    <p className="text-gray-600">Riwayat Medis</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {patientHistory && (
                            <div className="p-6 space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-blue-700">{patientHistory.summary.totalVisits}</div>
                                        <div className="text-sm text-blue-600">Kunjungan</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-green-700">{patientHistory.summary.totalPrescriptions}</div>
                                        <div className="text-sm text-green-600">Resep</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-purple-700">{patientHistory.summary.totalAppointments}</div>
                                        <div className="text-sm text-purple-600">Janji Temu</div>
                                    </div>
                                </div>

                                {/* Medical Records */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Rekam Medis
                                    </h3>
                                    {patientHistory.medicalRecords.length > 0 ? (
                                        <div className="space-y-3">
                                            {patientHistory.medicalRecords.map((record) => (
                                                <div key={record.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-semibold text-gray-800">{record.diagnosis}</div>
                                                        <div className="text-sm text-gray-500">{formatDate(record.created_at)}</div>
                                                    </div>
                                                    {record.treatment && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <strong>Pengobatan:</strong> {record.treatment}
                                                        </p>
                                                    )}
                                                    {record.notes && (
                                                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum ada rekam medis</p>
                                    )}
                                </div>

                                {/* Prescriptions */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Pill className="w-5 h-5" />
                                        Resep
                                    </h3>
                                    {patientHistory.prescriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {patientHistory.prescriptions.map((prescription) => (
                                                <div key={prescription.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">{formatDate(prescription.created_at)}</div>
                                                            <div className="text-sm text-gray-600 mt-1">{prescription.medications}</div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${prescription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {prescription.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum ada resep</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!patientHistory && (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
