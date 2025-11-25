import { useState, useEffect } from 'react'
import { ShieldAlert, Clock, User } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function AuditLogs() {
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
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-400" />
                        Audit Logs
                    </h1>
                    <p className="text-slate-400">Rekam jejak aktivitas keamanan sistem</p>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aktivitas</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detail</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada log aktivitas
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(log.timestamp).toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-slate-700">{log.user_name || 'System'}</span>
                                                    <span className="text-xs text-slate-400">({log.role || 'N/A'})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex px-2 py-1 rounded text-xs font-bold uppercase
                                                    ${log.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                                        log.action === 'LOGOUT' ? 'bg-yellow-100 text-yellow-700' :
                                                            log.action === 'REGISTER' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'}
                                                `}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    )
}
