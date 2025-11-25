import { useState, useEffect } from 'react'
import { BarChart, TrendingUp, Users, Calendar } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CountUp from '../../components/CountUp'

export default function Reports() {
    const [stats, setStats] = useState({
        revenue: 0,
        newPatients: 0,
        appointments: 0
    })

    useEffect(() => {
        // Mock data for now as we might not have real data today
        // In real app, fetch from /api/admin/reports/daily
        setStats({
            revenue: 1500000,
            newPatients: 5,
            appointments: 12
        })
    }, [])

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Laporan Harian</h1>
                    <p className="text-slate-600">Ringkasan operasional dan keuangan hari ini</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScrollReveal direction="up" delay={100}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold">Pendapatan</p>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    Rp <CountUp end={stats.revenue} />
                                </h3>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={200}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold">Pasien Baru</p>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    <CountUp end={stats.newPatients} />
                                </h3>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={300}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-bold">Janji Temu</p>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    <CountUp end={stats.appointments} />
                                </h3>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            <ScrollReveal direction="up" delay={400}>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center py-12">
                    <BarChart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">Grafik Detail Segera Hadir</h3>
                </div>
            </ScrollReveal>
        </div>
    )
}
