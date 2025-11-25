import { useState, useEffect } from 'react'
import { Users, Hash, Clock, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function QueueManagement() {
    const [queueData, setQueueData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        // Mock data - replace with actual API call
        setTimeout(() => {
            setQueueData({
                queueNumber: 'A-023',
                position: 5,
                estimatedWaitTime: 25, // in minutes
                status: 'waiting', // waiting, called, serving
                totalInQueue: 12
            })
            setLoading(false)
        }, 500)
    }, [])

    const handleJoinQueue = () => {
        // Implement join queue logic
        setToast({ show: true, message: 'Fitur ambil antrean akan segera ditambahkan!', type: 'info' })
    }

    const handleRefresh = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 500)
    }

    return (
        <div className="space-y-6 relative">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengelolaan Antrean</h1>
                        <p className="text-gray-600">Status antrean Anda hari ini</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-600 hover:shadow-lg transition-all duration-300"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </ScrollReveal>

            {loading ? (
                <ScrollReveal direction="up" delay={100}>
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data antrean...</p>
                    </div>
                </ScrollReveal>
            ) : !queueData ? (
                <ScrollReveal direction="up" delay={100}>
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Antrean</h3>
                        <p className="text-gray-600 mb-6">Anda belum mengambil nomor antrean hari ini</p>
                        <button
                            onClick={handleJoinQueue}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <Users className="w-5 h-5" />
                            Ambil Nomor Antrean
                        </button>
                    </div>
                </ScrollReveal>
            ) : (
                <>
                    {/* Queue Number Display */}
                    <ScrollReveal direction="up" delay={100}>
                        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                            </div>

                            <div className="relative z-10 text-center">
                                <p className="text-white/80 mb-2">Nomor Antrean Anda</p>
                                <div className="text-7xl font-bold mb-4 tracking-wider">
                                    {queueData.queueNumber}
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-semibold">Estimasi {queueData.estimatedWaitTime} menit</span>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Queue Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScrollReveal direction="up" delay={200}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <Hash className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Posisi Anda</p>
                                        <p className="text-2xl font-bold text-gray-900">{queueData.position}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={250}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Antrean</p>
                                        <p className="text-2xl font-bold text-gray-900">{queueData.totalInQueue}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={300}>
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <p className="text-lg font-bold text-green-600">Menunggu</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Info Card */}
                    <ScrollReveal direction="up" delay={350}>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting</h3>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Harap tetap berada di area klinik saat menunggu</li>
                                    <li>• Anda akan dipanggil saat giliran tiba</li>
                                    <li>• Waktu tunggu adalah estimasi dan dapat berubah</li>
                                </ul>
                            </div>
                        </div>
                    </ScrollReveal>
                </>
            )}
        </div>
    )
}
