import { useState, useEffect } from 'react'
import { Wallet, Download, Filter } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function FinancialReport() {
    const [payments, setPayments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPayments(data)
            }
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const totalRevenue = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
                        <p className="text-slate-500">Ringkasan pendapatan dan transaksi klinik</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Total Pendapatan</p>
                        <p className="text-3xl font-bold text-emerald-600">Rp {totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-slate-400" />
                            Riwayat Transaksi
                        </h3>
                        <button className="text-sm text-amber-600 font-bold hover:underline flex items-center gap-1">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Pasien</th>
                                    <th className="px-6 py-4">Layanan</th>
                                    <th className="px-6 py-4">Jumlah</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-400">#{payment.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{payment.patient_name}</td>
                                        <td className="px-6 py-4 text-slate-600">{payment.description}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">Rp {payment.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {payment.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(payment.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    )
}
