import { useState, useEffect } from 'react'
import { ClipboardList, Package, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import CountUp from '../../components/CountUp'
import { Link } from 'react-router-dom'

export default function PharmacistDashboard() {
    const [stats, setStats] = useState({
        pendingPrescriptions: 0,
        lowStockItems: 0,
        completedToday: 0,
        totalMedicines: 0
    })

    useEffect(() => {
        // Mock data - replace with API calls
        setStats({
            pendingPrescriptions: 5,
            lowStockItems: 3,
            completedToday: 12,
            totalMedicines: 150
        })
    }, [])

    const statCards = [
        {
            title: 'Resep Menunggu',
            value: stats.pendingPrescriptions,
            icon: ClipboardList,
            color: 'bg-orange-500',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            link: '/pharmacist/prescriptions'
        },
        {
            title: 'Stok Menipis',
            value: stats.lowStockItems,
            icon: AlertTriangle,
            color: 'bg-red-500',
            bg: 'bg-red-50',
            text: 'text-red-600',
            link: '/pharmacist/inventory'
        },
        {
            title: 'Selesai Hari Ini',
            value: stats.completedToday,
            icon: CheckCircle,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            link: '/pharmacist/prescriptions'
        },
        {
            title: 'Total Obat',
            value: stats.totalMedicines,
            icon: Package,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            link: '/pharmacist/inventory'
        }
    ]

    return (
        <div className="space-y-8">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Halo, Apoteker!</h2>
                        <p className="text-emerald-100 text-lg">
                            Siap melayani resep dan mengelola stok obat hari ini?
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                        <Link to={stat.link} className="block group">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-50 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 font-medium mb-1">{stat.title}</h3>
                                <div className="text-3xl font-bold text-slate-800 mb-2">
                                    <CountUp end={stat.value} />
                                </div>
                                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    Lihat Detail <ChevronRight className="w-3 h-3" />
                                </p>
                            </div>
                        </Link>
                    </ScrollReveal>
                ))}
            </div>
        </div>
    )
}
