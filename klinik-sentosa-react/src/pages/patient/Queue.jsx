import { useState, useEffect } from 'react'
import { Clock, Users, Ticket, AlertCircle, CheckCircle, RefreshCw, Zap, Calendar, X } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function Queue() {
    const [queueData, setQueueData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [takingQueue, setTakingQueue] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [appointments, setAppointments] = useState([])

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchQueueData()
        fetchTodayAppointments()

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            fetchQueueData()
        }, 15000)

        return () => clearInterval(interval)
    }, [])

    const fetchQueueData = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Gagal memuat data antrean')

            const data = await res.json()
            setQueueData(data)
            setError(null)
        } catch (err) {
            console.error(err)
            // Don't show error on auto-refresh failure to avoid annoyance
            if (loading) setError('Tidak dapat memuat data antrean.')
        } finally {
            setLoading(false)
        }
    }

    const fetchTodayAppointments = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const now = new Date()
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                const valid = data.filter(apt =>
                    apt.appointment_date === today &&
                    (apt.status === 'confirmed' || apt.status === 'pending')
                )
                setAppointments(valid)
            }
        } catch (err) {
            console.error(err)
        }
    }


    const handleTakeQueue = async (appointmentId) => {
        setTakingQueue(true)
        try {
            const res = await fetch('http://localhost:3000/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    patient_name: user.name
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Gagal mengambil antrean')

            // Immediately update queue display with new queue number
            setQueueData(prev => ({
                ...prev,
                myQueue: {
                    queue_number: data.queue_number,
                    status: 'waiting',
                    appointment_id: appointmentId
                }
            }))

            // Refresh from server after a short delay to get complete data
            setTimeout(() => fetchQueueData(), 500)

            setToast({ show: true, message: `Berhasil! Nomor antrean Anda: A-${String(data.queue_number).padStart(3, '0')}`, type: 'success' })
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' })
        } finally {
            setTakingQueue(false)
        }
    }

    const handleWalkInQueue = async () => {
        setShowConfirmModal(false)
        setTakingQueue(true)
        try {
            const res = await fetch('http://localhost:3000/api/queue/walkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_name: user.name
                })
            })

            // Handle non-JSON responses (like 404/500 HTML pages)
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server error: Received invalid response from server");
            }

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Gagal mengambil antrean')

            // Immediately update queue display with new queue number
            setQueueData(prev => ({
                ...prev,
                myQueue: {
                    queue_number: data.queue_number,
                    status: 'waiting',
                    appointment_id: data.appointment_id
                }
            }))

            // Refresh from server after a short delay to get complete data
            setTimeout(() => fetchQueueData(), 500)

            setToast({ show: true, message: `Berhasil! Nomor antrean Anda: A-${String(data.queue_number).padStart(3, '0')}`, type: 'success' })
        } catch (err) {
            console.error(err)
            setToast({ show: true, message: err.message || 'Terjadi kesalahan saat mengambil antrean', type: 'error' })
        } finally {
            setTakingQueue(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </div>
    )

    const myQueue = queueData?.myQueue
    const currentServing = queueData?.currentServing
    const totalQueues = queueData?.totalQueues || 0

    return (
        <div className="space-y-8 pb-12">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header Section */}
            <ScrollReveal>
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Ticket className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Antrean Klinik</h1>
                            <p className="text-primary-100">Pantau antrean Anda secara real-time dan nyaman.</p>
                        </div>
                        <button
                            onClick={fetchQueueData}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </ScrollReveal>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* My Queue Card */}
                <ScrollReveal delay={100}>
                    <div className={`relative h-full rounded-2xl p-6 shadow-lg transition-all duration-300 overflow-hidden ${myQueue
                        ? 'bg-white border-2 border-primary-500'
                        : 'bg-white border border-gray-100'
                        }`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${myQueue ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Ticket className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Nomor Antrean Anda</p>
                                <h3 className={`text-3xl font-bold ${myQueue ? 'text-primary-600' : 'text-gray-400'}`}>
                                    {myQueue ? `A-${String(myQueue.queue_number).padStart(3, '0')}` : '-'}
                                </h3>
                            </div>
                        </div>
                        {myQueue && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                {myQueue.status === 'waiting' ? 'Menunggu' : myQueue.status === 'serving' ? 'Sedang Dilayani' : myQueue.status}
                            </div>
                        )}
                    </div>
                </ScrollReveal>

                {/* Current Serving Card */}
                <ScrollReveal delay={200}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Sedang Dilayani</p>
                                <h3 className="text-3xl font-bold text-gray-800">
                                    {currentServing ? `A-${String(currentServing).padStart(3, '0')}` : '-'}
                                </h3>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Pasien yang sedang diperiksa dokter saat ini.
                        </div>
                    </div>
                </ScrollReveal>

                {/* Total Queue Card */}
                <ScrollReveal delay={300}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Total Antrean</p>
                                <h3 className="text-3xl font-bold text-gray-800">{totalQueues}</h3>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Jumlah total pasien dalam antrean hari ini.
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Action Section */}
            {(!myQueue || myQueue?.status === 'completed') && (
                <ScrollReveal delay={400}>
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Ambil Antrean
                        </h2>

                        {/* Walk-in Option */}
                        <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-8 shadow-lg border border-primary-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-shadow">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Antrean Cepat (Walk-in)</h3>
                                <p className="text-gray-600 max-w-lg">
                                    Belum punya janji temu? Ambil nomor antrean langsung dan Anda akan dilayani oleh dokter yang tersedia.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={takingQueue}
                                className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
                            >
                                <Ticket className="w-5 h-5" />
                                {takingQueue ? 'Memproses...' : 'Ambil Antrean Sekarang'}
                            </button>
                        </div>

                        {/* Appointment Option */}
                        {appointments.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    Pilih dari Janji Temu Hari Ini
                                </h3>
                                <div className="grid gap-4">
                                    {appointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                                            <div>
                                                <div className="font-bold text-gray-900">{apt.doctor_name}</div>
                                                <div className="text-sm text-gray-500">{apt.appointment_time} - {apt.specialization || 'Dokter Umum'}</div>
                                            </div>
                                            <button
                                                onClick={() => handleTakeQueue(apt.id)}
                                                disabled={takingQueue}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                            >
                                                Gunakan Janji Temu
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Konfirmasi Antrean</h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-primary-50 p-4 rounded-xl mb-6 flex gap-4">
                            <div className="p-3 bg-primary-100 rounded-full h-fit">
                                <Ticket className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Antrean Walk-in</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Anda akan mengambil antrean untuk dokter umum yang tersedia saat ini.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleWalkInQueue}
                                className="flex-1 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                            >
                                Ya, Ambil Antrean
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
