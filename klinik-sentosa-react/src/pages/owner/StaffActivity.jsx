import { useState, useEffect } from 'react'
import { Activity, Search } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function StaffActivity() {
    const [logs, setLogs] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/admin/audit-logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setLogs(data)
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-800">Aktivitas Klinik</h1>
                    <p className="text-slate-500">Log aktivitas staf dan sistem</p>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-slate-400" />
                            Log Aktivitas Terbaru
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Aksi</th>
                                    <th className="px-6 py-4">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{log.user_name || 'System'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg uppercase font-bold">
                                                {log.role || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{log.action}</td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.details}>
                                            {log.details}
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
