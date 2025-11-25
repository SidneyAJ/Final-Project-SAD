import { useState, useEffect } from 'react'
import { FileText, Calendar, User, Stethoscope, Pill, FileCheck, ChevronDown, ChevronUp } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function PatientMedicalRecords() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchRecords()
    }, [])

    const fetchRecords = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/medical-records', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setRecords(data)
            }
        } catch (error) {
            console.error('Failed to fetch medical records:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <ScrollReveal>
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <FileText className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Rekam Medis Saya</h1>
                            <p className="text-primary-100">Riwayat pemeriksaan dan diagnosis kesehatan Anda</p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal delay={100}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Rekam Medis</p>
                                <p className="text-2xl font-bold text-gray-800">{records.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 rounded-lg">
                                <Stethoscope className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dokter Berbeda</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {new Set(records.map(r => r.doctor_id)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-violet-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pemeriksaan Terakhir</p>
                                <p className="text-sm font-bold text-gray-800">
                                    {records.length > 0 ? new Date(records[0].created_at).toLocaleDateString('id-ID') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Medical Records List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Daftar Rekam Medis</h3>

                {records.length === 0 ? (
                    <ScrollReveal>
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada rekam medis</h3>
                            <p className="text-gray-600">Rekam medis akan muncul setelah Anda melakukan pemeriksaan</p>
                        </div>
                    </ScrollReveal>
                ) : (
                    records.map((record, idx) => (
                        <ScrollReveal key={record.id} delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                                <div
                                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-primary-100 rounded-lg">
                                                    <FileText className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{formatDate(record.created_at)}</h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4" />
                                                        {record.doctor_name} {record.specialization && `- ${record.specialization}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-50 px-4 py-2 rounded-lg inline-block">
                                                <p className="text-sm font-medium text-primary-700">
                                                    <span className="font-semibold">Diagnosis:</span> {record.diagnosis}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            {expandedId === record.id ? (
                                                <ChevronUp className="w-6 h-6 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {expandedId === record.id && (
                                    <div className="px-6 pb-6 pt-0 border-t border-gray-100 bg-gray-50 space-y-4">
                                        {record.treatment && (
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                    <Pill className="w-4 h-4 text-emerald-600" />
                                                    Tindakan & Pengobatan
                                                </div>
                                                <p className="text-gray-700 bg-white p-4 rounded-lg mb-3">{record.treatment}</p>

                                                {/* Link to Prescriptions */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        window.location.href = '/patient/prescriptions'
                                                    }}
                                                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 hover:underline"
                                                >
                                                    <Pill className="w-4 h-4" />
                                                    Lihat Resep Obat
                                                </button>
                                            </div>
                                        )}
                                        {record.notes && (
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                    <FileCheck className="w-4 h-4 text-violet-600" />
                                                    Catatan Tambahan
                                                </div>
                                                <p className="text-gray-700 bg-white p-4 rounded-lg">{record.notes}</p>
                                            </div>
                                        )}
                                        {record.appointment_date && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>Tanggal Janji Temu: {new Date(record.appointment_date).toLocaleDateString('id-ID')}</span>
                                                {record.appointment_time && <span>• Jam {record.appointment_time}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>
        </div>
    )
}
