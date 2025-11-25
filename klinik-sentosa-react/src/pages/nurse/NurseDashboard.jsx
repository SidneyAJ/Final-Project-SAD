import { useState, useEffect } from 'react'
import { Users, Activity, Calendar, Clock, ArrowRight } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CountUp from '../../components/CountUp'
import { Link } from 'react-router-dom'

export default function NurseDashboard() {
    const [user, setUser] = useState({})
    const [stats, setStats] = useState({
        queueWaiting: 0,
        vitalsRecorded: 0,
        todayPatients: 0
    })

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(userData)

        // Mock stats
        setStats({
            queueWaiting: 5,
            vitalsRecorded: 12,
            todayPatients: 25
        })
    }, [])

    const statCards = [
        {
            title: 'Antrean Menunggu',
            value: stats.queueWaiting,
            icon: Users,
            color: 'from-pink-500 to-rose-500',
            desc: 'Pasien perlu screening'
        },
        {
            title: 'Tanda Vital Dicatat',
            value: stats.vitalsRecorded,
            icon: Activity,
            color: 'from-purple-500 to-indigo-500',
            desc: 'Hari ini'
        },
        {
            title: 'Total Pasien',
            value: stats.todayPatients,
            icon: Calendar,
            color: 'from-blue-500 to-cyan-500',
            desc: 'Terdaftar hari ini'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="w-8 h-8" />
                            <h2 className="text-3xl font-bold">Selamat Datang, {user.name}!</h2>
                        </div>
                        <p className="text-white/90 text-lg">
                            Ada {stats.queueWaiting} pasien menunggu pemeriksaan tanda vital. Semangat bertugas!
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hari Ini</span>
                            </div>
                            <h3 className="text-gray-500 font-medium mb-1">{stat.title}</h3>
                            <div className="text-3xl font-bold text-gray-800 mb-2">
                                <CountUp end={stat.value} />
                            </div>
                            <p className="text-sm text-gray-400">{stat.desc}</p>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollReveal direction="left" delay={200}>
                    <Link to="/nurse/queue" className="block group">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-pink-200 transition-all h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Antrean & Screening</h3>
                            <p className="text-gray-500">Lihat antrean dan panggil pasien untuk pemeriksaan awal.</p>
                        </div>
                    </Link>
                </ScrollReveal>

                <ScrollReveal direction="right" delay={200}>
                    <Link to="/nurse/vitals" className="block group">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-purple-200 transition-all h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Input Tanda Vital</h3>
                            <p className="text-gray-500">Catat tekanan darah, suhu, dan data fisik pasien.</p>
                        </div>
                    </Link>
                </ScrollReveal>
            </div>
        </div>
    )
}
