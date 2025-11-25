import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle, Loader, Search, Filter, Users as UsersIcon, Check, X, CheckCircle2, Stethoscope } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function DoctorAppointments() {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, in_consultation, no_show
    const [dateFilter, setDateFilter] = useState('today') // today, week, all
    const [searchQuery, setSearchQuery] = useState('')
    const [hideCompleted, setHideCompleted] = useState(false) // Toggle for hiding completed
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchAppointments()
        const interval = setInterval(fetchAppointments, 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [dateFilter])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const fetchAppointments = async () => {
        try {
            let url = 'http://localhost:3000/api/doctors/appointments'

            // Add date filter
            if (dateFilter === 'today') {
                const date = new Date()
                const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                url += `?date=${today}`
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setAppointments(data)
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:3000/api/appointments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                showToast(
                    newStatus === 'confirmed' ? 'Janji temu dikonfirmasi & masuk antrean!' :
                        newStatus === 'cancelled' ? 'Janji temu ditolak' :
                            'Status berhasil diperbarui',
                    'success'
                )
                fetchAppointments()
            } else {
                showToast('Gagal memperbarui status', 'error')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            showToast('Terjadi kesalahan', 'error')
        }
    }

    const filteredAppointments = appointments.filter(apt => {
        const matchesFilter = filter === 'all' || apt.status === filter
        const matchesSearch = apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesHideCompleted = !hideCompleted || apt.status !== 'completed'
        return matchesFilter && matchesSearch && matchesHideCompleted
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-300'
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-300'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
            case 'completed': return 'bg-primary-100 text-primary-700 border-primary-300'
            case 'in_consultation': return 'bg-violet-100 text-violet-700 border-violet-300'
            case 'no_show': return 'bg-gray-100 text-gray-700 border-gray-300'
            default: return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Dikonfirmasi'
            case 'pending': return 'Menunggu'
            case 'cancelled': return 'Dibatalkan'
            case 'completed': return 'Selesai'
            case 'in_consultation': return 'Konsultasi'
            case 'no_show': return 'Tidak Hadir'
            default: return status
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
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

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Janji Temu</h1>
                    <p className="text-gray-600">Kelola dan pantau janji temu pasien</p>
                </div>
            </ScrollReveal>

            {/* Stats Summary */}
            <ScrollReveal direction="up" delay={50}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="text-2xl font-bold text-gray-800">{appointments.length}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 shadow-md border border-amber-100">
                        <div className="text-2xl font-bold text-amber-700">
                            {appointments.filter(a => a.status === 'pending').length}
                        </div>
                        <div className="text-sm text-amber-600">Menunggu</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 shadow-md border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-700">
                            {appointments.filter(a => a.status === 'confirmed').length}
                        </div>
                        <div className="text-sm text-emerald-600">Dikonfirmasi</div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4 shadow-md border border-primary-100">
                        <div className="text-2xl font-bold text-primary-700">
                            {appointments.filter(a => a.status === 'completed').length}
                        </div>
                        <div className="text-sm text-primary-600">Selesai</div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Filters & Search */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex flex-col gap-4">
                        {/* Date Filter */}
                        <div className="flex gap-2">
                            {['today', 'week', 'all'].map((df) => (
                                <button
                                    key={df}
                                    onClick={() => setDateFilter(df)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${dateFilter === df
                                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {df === 'today' ? 'Hari Ini' : df === 'week' ? 'Minggu Ini' : 'Semua'}
                                </button>
                            ))}
                        </div>

                        {/* Search and Status Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama pasien..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2 overflow-x-auto">
                                {['all', 'pending', 'confirmed', 'in_consultation', 'completed', 'no_show'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${filter === f
                                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f === 'all' ? 'Semua' : getStatusLabel(f)}
                                    </button>
                                ))}
                                {/* Hide Completed Toggle */}
                                <button
                                    onClick={() => setHideCompleted(!hideCompleted)}
                                    className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${hideCompleted
                                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title={hideCompleted ? 'Tampilkan Selesai' : 'Sembunyikan Selesai'}
                                >
                                    {hideCompleted ? '👁️ Tampilkan Selesai' : '🙈 Sembunyikan Selesai'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <ScrollReveal direction="up">
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada janji temu</h3>
                            <p className="text-gray-600">Janji temu akan muncul di sini</p>
                        </div>
                    </ScrollReveal>
                ) : (
                    filteredAppointments.map((apt, idx) => (
                        <ScrollReveal key={apt.id} direction="up" delay={idx * 30}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Patient Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                {apt.patient_name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{apt.patient_name}</h3>
                                                <p className="text-sm text-gray-500">NIK: {apt.nik}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(apt.appointment_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{apt.appointment_time}</span>
                                            </div>
                                            {apt.queue_number && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <UsersIcon className="w-4 h-4" />
                                                    <span>Antrean: {apt.queue_number}</span>
                                                </div>
                                            )}
                                        </div>

                                        {apt.notes && (
                                            <p className="text-gray-600 text-sm">
                                                <strong>Keluhan:</strong> {apt.notes}
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                                                {getStatusLabel(apt.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                                        {apt.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Konfirmasi
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Tolak
                                                </button>
                                            </>
                                        )}
                                        {(apt.status === 'confirmed' || apt.status === 'in_consultation') && (
                                            <button
                                                onClick={() => navigate('/doctor/examination', {
                                                    state: {
                                                        patient: {
                                                            patient_id: apt.patient_id,
                                                            patient_name: apt.patient_name
                                                        },
                                                        appointment: {
                                                            appointment_id: apt.id,
                                                            appointment_time: apt.appointment_time,
                                                            notes: apt.notes,
                                                            queue_number: apt.queue_number
                                                        }
                                                    }
                                                })}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors"
                                            >
                                                <Stethoscope className="w-4 h-4" />
                                                Periksa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>
        </div>
    )
}
