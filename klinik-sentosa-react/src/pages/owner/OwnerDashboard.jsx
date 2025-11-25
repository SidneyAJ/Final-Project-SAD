import { useState, useEffect } from 'react'
import { Users, Wallet, Calendar, Activity, TrendingUp, ChevronRight } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CountUp from '../../components/CountUp'
import { Link } from 'react-router-dom'

export default function OwnerDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        patients: 0,
        appointments: 0,
        activeStaff: 0
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token')
            // Re-use admin reports endpoint as it's now accessible by owner
            const response = await fetch('http://localhost:3000/api/admin/reports/daily', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStats({
                    revenue: data.revenue,
                    patients: data.newPatients,
                    appointments: data.appointments,
                    activeStaff: 12 // Mock for now
                })
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const statCards = [
        {
            title: 'Pendapatan Hari Ini',
            value: stats.revenue,
            prefix: 'Rp ',
            icon: Wallet,
            color: 'bg-amber-500',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            link: '/owner/financial'
        },
        {
            title: 'Pasien Baru',
            value: stats.patients,
            icon: Users,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            link: '/owner/activity'
        },
        {
            title: 'Janji Temu',
            value: stats.appointments,
            icon: Calendar,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            link: '/owner/activity'
        },
        {
            title: 'Staf Aktif',
            value: stats.activeStaff,
            icon: Activity,
            color: 'bg-purple-500',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            link: '/owner/activity'
        }
    ]

    return (
        <div className="space-y-8">
            <ScrollReveal direction="up">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Selamat Datang, Pemilik!</h2>
                        <p className="text-slate-400 text-lg">
                            Pantau performa klinik Anda secara real-time hari ini.
                        </p>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none" />
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                        <Link to={stat.link} className="block group">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <TrendingUp className={`w-5 h-5 ${stat.text} opacity-50`} />
                                </div>
                                <h3 className="text-slate-500 font-medium mb-1">{stat.title}</h3>
                                <div className="text-2xl font-bold text-slate-800 mb-2 truncate">
                                    {stat.prefix && <span className="text-sm font-normal text-slate-400">{stat.prefix}</span>}
                                    <CountUp end={stat.value} />
                                </div>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                                    Lihat Detail <ChevronRight className="w-3 h-3" />
                                </p>
                            </div>
                        </Link>
                    </ScrollReveal>
                ))}
            </div>

            {/* Placeholder for Charts */}
            <ScrollReveal direction="up" delay={400}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-80 flex items-center justify-center">
                        <p className="text-slate-400">Grafik Pendapatan (Coming Soon)</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-80 flex items-center justify-center">
                        <p className="text-slate-400">Grafik Kunjungan Pasien (Coming Soon)</p>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    )
}
