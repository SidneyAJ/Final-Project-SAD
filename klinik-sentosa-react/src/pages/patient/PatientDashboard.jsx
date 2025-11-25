import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Calendar, Users, FileText, Pill, CreditCard, Activity,
    TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight,
    Heart, Stethoscope, Plus
} from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function PatientDashboard() {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        queuePosition: null,
        activePrescriptions: 0,
        pendingPayments: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const headers = { 'Authorization': `Bearer ${token}` }

                // Fetch Appointments
                const appointmentsRes = await fetch('http://localhost:3000/api/appointments', { headers })
                const appointments = await appointmentsRes.json()
                const upcoming = appointments.filter(a => new Date(a.appointment_date) >= new Date()).length

                // Fetch Queue
                const queueRes = await fetch('http://localhost:3000/api/queue', { headers })
                const queueData = await queueRes.json()

                // Fetch Prescriptions
                const prescriptionsRes = await fetch('http://localhost:3000/api/pharmacy/prescriptions?status=pending', { headers })
                const prescriptions = await prescriptionsRes.json()

                // Fetch Payments
                const paymentsRes = await fetch('http://localhost:3000/api/payments', { headers })
                const payments = await paymentsRes.json()
                const pendingBills = payments.filter(p => p.status === 'pending').length

                setStats({
                    upcomingAppointments: upcoming,
                    queuePosition: queueData.myQueue ? queueData.myQueue.queue_number : null,
                    activePrescriptions: prescriptions.length,
                    pendingPayments: pendingBills
                })

                // Generate Activity Feed from real data
                const activities = []

                // Add recent appointments
                appointments.slice(0, 2).forEach(a => {
                    activities.push({
                        icon: Calendar,
                        title: 'Janji Temu',
                        description: `Dengan ${a.doctor_name} - ${a.appointment_date}`,
                        time: a.status,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-100'
                    })
                })

                // Add recent payments
                payments.slice(0, 2).forEach(p => {
                    activities.push({
                        icon: CreditCard,
                        title: 'Tagihan',
                        description: `Rp ${p.amount.toLocaleString()}`,
                        time: p.status,
                        color: p.status === 'paid' ? 'text-green-600' : 'text-orange-600',
                        bgColor: p.status === 'paid' ? 'bg-green-100' : 'bg-orange-100'
                    })
                })

                setRecentActivity(activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5))

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const quickActions = [
        {
            icon: Calendar,
            title: 'Buat Janji Temu',
            description: 'Jadwalkan konsultasi',
            color: 'from-blue-500 to-cyan-500',
            link: '/patient/appointments'
        },
        {
            icon: Users,
            title: 'Ambil Antrean',
            description: 'Nomor antrean digital',
            color: 'from-purple-500 to-pink-500',
            link: '/patient/queue'
        },
        {
            icon: Pill,
            title: 'Resep Obat',
            description: 'Cek resep dokter',
            color: 'from-green-500 to-emerald-500',
            link: '/patient/prescriptions'
        },
        {
            icon: CreditCard,
            title: 'Tagihan',
            description: 'Status pembayaran',
            color: 'from-orange-500 to-amber-500',
            link: '/patient/payments'
        }
    ]

    const statsCards = [
        {
            icon: Calendar,
            title: 'Janji Temu',
            value: stats.upcomingAppointments,
            subtitle: 'Akan datang',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50'
        },
        {
            icon: Users,
            title: 'Antrean',
            value: stats.queuePosition ? `A-${String(stats.queuePosition).padStart(3, '0')}` : '-',
            subtitle: 'Nomor Anda',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50'
        },
        {
            icon: Pill,
            title: 'Resep',
            value: stats.activePrescriptions,
            subtitle: 'Menunggu',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'from-green-50 to-emerald-50'
        },
        {
            icon: AlertCircle,
            title: 'Tagihan',
            value: stats.pendingPayments,
            subtitle: 'Belum lunas',
            color: 'from-orange-500 to-amber-500',
            bgColor: 'from-orange-50 to-amber-50'
        }
    ]

    return (
        <div className="space-y-8 pb-20">
            {/* Welcome Section */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Heart className="w-8 h-8 animate-pulse" />
                                <h2 className="text-3xl font-bold">Halo, {user.name}!</h2>
                            </div>
                            <p className="text-white/90 text-lg max-w-xl">
                                Semoga hari Anda menyenangkan. Jangan lupa jaga kesehatan!
                            </p>
                        </div>
                        <Link to="/patient/appointments" className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all flex items-center gap-2 group">
                            <Plus className="w-5 h-5" />
                            Buat Janji Baru
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                        <Stethoscope className="w-64 h-64 transform translate-x-12 translate-y-12" strokeWidth={1} />
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {statsCards.map((stat, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                        <div className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-5 border border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                            <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <ScrollReveal direction="up" delay={200}>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Activity className="w-6 h-6 text-primary-600" />
                            Menu Utama
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    to={action.link}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex items-center gap-4"
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <action.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">{action.title}</h4>
                                        <p className="text-sm text-gray-500">{action.description}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>

                {/* Recent Activity / Notifications */}
                <div className="lg:col-span-1">
                    <ScrollReveal direction="left" delay={300}>
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 h-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-primary-600" />
                                Aktivitas
                            </h3>

                            {recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className={`${activity.bgColor} p-2 rounded-lg`}>
                                                <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 text-sm">{activity.title}</h4>
                                                <p className="text-xs text-gray-500">{activity.description}</p>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 block">{activity.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Belum ada aktivitas terbaru</p>
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    )
}
