import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Calendar, Users, FileText, Pill, Activity,
    TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight,
    Stethoscope, Heart, X, Check
} from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function DoctorDashboard() {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        queueSize: 0,
        patientsTreated: 0,
        pendingRecords: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [pendingAppointments, setPendingAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/doctors/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStats({
                    todayAppointments: data.todayAppointments,
                    queueSize: data.queueSize,
                    patientsTreated: data.patientsTreated,
                    pendingRecords: data.pendingRecords
                })
                setRecentActivity(data.recentActivity || [])
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const fetchPendingAppointments = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Filter only pending appointments
                const pending = data.filter(app => app.status === 'pending')
                setPendingAppointments(pending)
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error)
        }
    }

    useEffect(() => {
        Promise.all([fetchStats(), fetchPendingAppointments()]).then(() => setLoading(false))

        const interval = setInterval(() => {
            fetchStats()
            fetchPendingAppointments()
        }, 30000)
        return () => clearInterval(interval)
    }, [token])

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
                let message = 'Janji temu diperbarui'
                if (newStatus === 'confirmed') {
                    message = 'Janji temu dikonfirmasi & masuk antrean!'
                } else if (newStatus === 'postponed') {
                    message = 'Janji temu ditunda'
                } else if (newStatus === 'cancelled') {
                    message = 'Janji temu ditolak'
                }

                showToast(message, 'success')
                fetchPendingAppointments()
                fetchStats()
            } else {
                showToast('Gagal memperbarui status', 'error')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            showToast('Terjadi kesalahan', 'error')
        }
    }

    // Helper function to calculate time ago
    const getTimeAgo = (timestamp) => {
        const now = new Date()
        const past = new Date(timestamp)
        const diffMs = now - past
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit lalu`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} jam lalu`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays} hari lalu`
    }

    const quickActions = [
        {
            icon: FileText,
            title: 'Buat Rekam Medis',
            description: 'Catat hasil pemeriksaan pasien',
            color: 'from-primary-500 to-secondary-500',
            link: '/doctor/examination'
        },
        {
            icon: Users,
            title: 'Daftar Pasien',
            description: 'Lihat semua pasien hari ini',
            color: 'from-emerald-500 to-teal-500',
            link: '/doctor/examination'
        },
        {
            icon: Users,
            title: 'Panggil Pasien',
            description: 'Lihat dan kelola antrean',
            color: 'from-violet-500 to-purple-500',
            link: '/doctor/queue'
        },
        {
            icon: Calendar,
            title: 'Lihat Jadwal',
            description: 'Kelola janji temu hari ini',
            color: 'from-amber-500 to-orange-500',
            link: '/doctor/appointments'
        }
    ]

    const statsCards = [
        {
            icon: Calendar,
            title: 'Janji Temu',
            value: stats.todayAppointments,
            subtitle: 'Hari ini',
            color: 'from-primary-500 to-secondary-500',
            bgColor: 'from-primary-50 to-secondary-50'
        },
        {
            icon: Users,
            title: 'Antrean',
            value: stats.queueSize,
            subtitle: 'Pasien menunggu',
            color: 'from-violet-500 to-purple-500',
            bgColor: 'from-violet-50 to-purple-50'
        },
        {
            icon: CheckCircle2,
            title: 'Pasien Dilayani',
            value: stats.patientsTreated,
            subtitle: 'Hari ini',
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'from-emerald-50 to-teal-50'
        },
        {
            icon: AlertCircle,
            title: 'Pending',
            value: stats.pendingRecords,
            subtitle: 'Rekam medis',
            color: 'from-amber-500 to-orange-500',
            bgColor: 'from-amber-50 to-orange-50'
        }
    ]

    return (
        <div className="space-y-8">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Welcome Section */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Stethoscope className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Selamat Datang, {user.name}!</h2>
                                <p className="text-primary-100">Dokter Spesialis</p>
                            </div>
                        </div>
                        <p className="text-white/90 text-lg mt-4 max-w-2xl">
                            Anda memiliki {stats.todayAppointments} janji temu dan {stats.queueSize} pasien dalam antrean hari ini.
                            Semangat melayani pasien! 💪
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-10 translate-y-10">
                        <Heart className="w-64 h-64" strokeWidth={1} />
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                        <div className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}>
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Appointments Section */}
                <div className="lg:col-span-2 space-y-8">
                    <ScrollReveal direction="up" delay={200}>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-primary-600" />
                                    Permintaan Janji Temu
                                    {pendingAppointments.length > 0 && (
                                        <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                                            {pendingAppointments.length} Baru
                                        </span>
                                    )}
                                </h3>
                                <Link to="/doctor/appointments" className="text-primary-600 text-sm font-medium hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>

                            {pendingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingAppointments.slice(0, 3).map((app) => (
                                        <div key={app.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                                                        {app.patient_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{app.patient_name}</h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(app.appointment_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {app.appointment_time}
                                                            </span>
                                                        </div>
                                                        {app.notes && (
                                                            <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded-lg border border-gray-100 inline-block">
                                                                "{app.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                                                        className="px-3 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1 text-sm font-medium"
                                                        title="Tolak"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Tolak
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(app.id, 'postponed')}
                                                        className="px-3 py-2 text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1 text-sm font-medium"
                                                        title="Tunda"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                        Tunda
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                                                        className="px-3 py-2 text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center gap-1 text-sm font-medium"
                                                        title="Konfirmasi"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Konfirmasi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Tidak ada permintaan janji temu baru</p>
                                </div>
                            )}
                        </div>
                    </ScrollReveal>

                    {/* Quick Actions Grid */}
                    <ScrollReveal direction="up" delay={300}>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-primary-600" />
                                Aksi Cepat
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {quickActions.map((action, idx) => (
                                    <Link
                                        key={idx}
                                        to={action.link}
                                        className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                                            <action.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">{action.title}</h4>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                        <div className="mt-4 flex items-center text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            Mulai
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="lg:col-span-1">
                    <ScrollReveal direction="left" delay={400}>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 h-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-primary-600" />
                                Aktivitas Terbaru
                            </h3>
                            <div className="space-y-6 relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100"></div>

                                {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                                    <div key={idx} className="relative pl-10 group">
                                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-gray-100 group-hover:border-primary-500 transition-colors z-10`}>
                                            <div className={`w-2 h-2 rounded-full bg-primary-500`}></div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                            <h4 className="font-semibold text-gray-800 text-sm">{activity.title || activity.action}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{activity.description || activity.details}</p>
                                            <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getTimeAgo(activity.updated_at || activity.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Belum ada aktivitas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    )
}
