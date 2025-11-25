import { useState, useEffect } from 'react'
import { Users, DollarSign, Activity, Calendar, TrendingUp, Clock, UserCheck, AlertCircle } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CountUp from '../../components/CountUp'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayRevenue: 0,
        activeStaff: 0,
        appointmentsToday: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // Fetch real stats from API
            const response = await fetch('http://localhost:3000/api/admin/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                // If API fails or returns empty, keep zeros
                console.log('No stats available yet')
            }
        } catch (err) {
            console.error('Error fetching stats:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: 'Total Pasien',
            value: stats.totalPatients,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            desc: 'Terdaftar di sistem',
            trend: '+12%'
        },
        {
            title: 'Pendapatan Hari Ini',
            value: stats.todayRevenue,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
            desc: 'Update real-time',
            format: 'currency',
            trend: '+8%'
        },
        {
            title: 'Staf Aktif',
            value: stats.activeStaff,
            icon: Activity,
            color: 'from-purple-500 to-indigo-500',
            desc: 'Dokter & Perawat',
            trend: '100%'
        },
        {
            title: 'Janji Temu',
            value: stats.appointmentsToday,
            icon: Calendar,
            color: 'from-orange-500 to-amber-500',
            desc: 'Jadwal hari ini',
            trend: '+5'
        }
    ]

    const formatValue = (value, format) => {
        if (format === 'currency') {
            return `Rp ${value.toLocaleString('id-ID')}`
        }
        return value
    }

    const hasData = stats.totalPatients > 0 || stats.todayRevenue > 0 || stats.activeStaff > 0 || stats.appointmentsToday > 0

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Memuat data dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">Dashboard Administrator</h2>
                        <p className="text-white/90 text-lg font-medium">
                            Pantau operasional klinik secara real-time
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats Cards */}
            {hasData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, idx) => (
                        <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {stat.trend}
                                    </div>
                                </div>
                                <h3 className="text-slate-500 font-semibold mb-2 text-sm uppercase tracking-wide">{stat.title}</h3>
                                <div className="text-3xl font-bold text-slate-800 mb-2">
                                    {stat.format === 'currency' ? formatValue(stat.value, 'currency') : <CountUp end={stat.value} />}
                                </div>
                                <p className="text-sm text-slate-400 font-medium">{stat.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            ) : (
                <ScrollReveal direction="up">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="max-w-md mx-auto">
                            {/* Empty state illustration */}
                            <div className="mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-12 h-12 text-primary-600" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                Belum Ada Data
                            </h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Dashboard masih kosong. Data statistik akan muncul secara otomatis setelah ada pasien terdaftar, janji temu dibuat, dan transaksi dilakukan.
                            </p>

                            {/* Action cards */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <UserCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-700">Daftarkan Pasien</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-700">Buat Janji Temu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Quick Actions */}
            <ScrollReveal direction="up">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        Aktivitas Terkini
                    </h3>
                    {hasData ? (
                        <div className="text-slate-600 py-8 text-center">
                            <p className="font-medium">Fitur aktivitas akan segera hadir</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">Belum ada aktivitas tercatat</p>
                            <p className="text-sm text-slate-400 mt-2">Log aktivitas akan muncul di sini</p>
                        </div>
                    )}
                </div>
            </ScrollReveal>
        </div>
    )
}
