import { useState, useEffect } from 'react'
import { Users, Phone, Clock, CheckCircle, AlertCircle, User, UserX, ChevronRight, CheckCircle2 } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function DoctorQueue() {
    const [queueData, setQueueData] = useState({
        currentServing: null,
        nextInLine: null,
        queueList: [],
        summary: {
            total: 0,
            waiting: 0,
            called: 0,
            completed: 0,
            noShow: 0
        }
    })
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchQueue()
        const interval = setInterval(fetchQueue, 15000) // Refresh every 15s
        return () => clearInterval(interval)
    }, [])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/queue/current', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setQueueData(data)
            }
        } catch (error) {
            console.error('Failed to fetch queue:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCallNext = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/queue/call-next', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                const data = await res.json()
                showToast(`Memanggil: ${data.patient_name} (${data.queue_number})`, 'success')
                fetchQueue() // Refresh queue
            } else {
                const error = await res.json()
                showToast(error.error || 'Gagal memanggil pasien', 'error')
            }
        } catch (error) {
            console.error('Failed to call next:', error)
            showToast('Gagal memanggil pasien', 'error')
        }
    }

    const handleSkipPatient = async (queueId, queueNumber) => {
        if (!confirm(`Tandai pasien ${queueNumber} sebagai tidak hadir?`)) return

        try {
            const res = await fetch(`http://localhost:3000/api/doctors/queue/${queueId}/skip`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                const data = await res.json()
                showToast(data.message, 'success')
                fetchQueue() // Refresh queue
            } else {
                const error = await res.json()
                showToast(error.error || 'Gagal melewati pasien', 'error')
            }
        } catch (error) {
            console.error('Failed to skip patient:', error)
            showToast('Gagal melewati pasien', 'error')
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            waiting: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Menunggu' },
            called: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Dipanggil' },
            completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Selesai' },
            no_show: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tidak Hadir' }
        }
        const badge = badges[status] || badges.waiting
        return (
            <div className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-lg text-sm font-semibold`}>
                {badge.label}
            </div>
        )
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return '-'
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Antrean</h1>
                    <p className="text-gray-600">Kelola antrean pasien hari ini</p>
                </div>
            </ScrollReveal>

            {/* Queue Summary Stats */}
            <ScrollReveal direction="up" delay={50}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="text-2xl font-bold text-gray-800">{queueData.summary.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 shadow-md border border-amber-100">
                        <div className="text-2xl font-bold text-amber-700">{queueData.summary.waiting}</div>
                        <div className="text-sm text-amber-600">Menunggu</div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4 shadow-md border border-primary-100">
                        <div className="text-2xl font-bold text-primary-700">{queueData.summary.called}</div>
                        <div className="text-sm text-primary-600">Dipanggil</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 shadow-md border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-700">{queueData.summary.completed}</div>
                        <div className="text-sm text-emerald-600">Selesai</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 shadow-md border border-red-100">
                        <div className="text-2xl font-bold text-red-700">{queueData.summary.noShow}</div>
                        <div className="text-sm text-red-600">Tidak Hadir</div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Next in Line */}
            {queueData.nextInLine && (
                <ScrollReveal direction="up" delay={125}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Selanjutnya</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                {queueData.nextInLine.queue_number}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{queueData.nextInLine.patient_name}</h3>
                                <p className="text-sm text-gray-600">Waktu: {queueData.nextInLine.appointment_time}</p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Call Next Button */}
            <ScrollReveal direction="up" delay={150}>
                <button
                    onClick={handleCallNext}
                    disabled={queueData.summary.waiting === 0}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Phone className="w-5 h-5" />
                    Panggil Pasien Berikutnya
                </button>
            </ScrollReveal>

            {/* Queue List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">
                    Daftar Antrean ({queueData.queueList.length} total)
                </h3>

                {queueData.queueList.length > 0 ? (
                    queueData.queueList.map((patient, idx) => (
                        <ScrollReveal key={patient.queue_id} direction="up" delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 ${patient.queue_status === 'waiting' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                            patient.queue_status === 'called' ? 'bg-gradient-to-br from-primary-500 to-secondary-500' :
                                                patient.queue_status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' :
                                                    'bg-gradient-to-br from-red-500 to-pink-500'
                                            } rounded-xl flex items-center justify-center text-white font-bold`}>
                                            {patient.queue_number}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{patient.patient_name}</h4>
                                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                <span>Waktu: {patient.appointment_time}</span>
                                                <span>Bergabung: {formatTime(patient.created_at)}</span>
                                            </div>
                                            {patient.notes && patient.notes !== 'Walk-in Queue' && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    <span className="font-medium">Keluhan:</span> {patient.notes}
                                                </p>
                                            )}
                                            {patient.notes === 'Walk-in Queue' && (
                                                <span className="inline-block px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded mt-1">
                                                    Walk-in
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(patient.queue_status)}
                                        {patient.queue_status === 'waiting' && (
                                            <button
                                                onClick={() => handleSkipPatient(patient.queue_id, patient.queue_number)}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
                                            >
                                                <UserX className="w-4 h-4" />
                                                Lewati
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada antrean</h3>
                        <p className="text-gray-600">Pasien akan muncul di sini saat bergabung</p>
                    </div>
                )}
            </div>
        </div>
    )
}
